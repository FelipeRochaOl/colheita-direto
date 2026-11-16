import base64

from anthropic import AnthropicBedrockMantle

from app.classifiers.base_classifier import ImageClassifier
from app.schemas.pest_schemas import PestAssessment
from app.schemas.quality_schemas import QualityAssessment
from app.services.image_normalizer import NormalizedImage
from app.settings import VisionSettings

QUALITY_RUBRIC = """Você é classificador de hortifrúti de uma cooperativa brasileira. Avalie as fotos de um lote de {crop} \
(caixas de ~{box_weight_kg} kg) e atribua UMA classe ao lote inteiro:

A: padrão comercial. Cor e tamanho uniformes, sem defeitos visíveis relevantes.
B: próprio para venda com desconto. Defeitos só estéticos e leves (pequenas manchas, formato irregular, tamanho desigual).
C: fora do padrão de venda in natura, mas próprio para consumo ou indústria (polpa, molho). Amassados, maturação avançada, cortes superficiais.
D: impróprio para venda. Podridão, mofo, pragas ativas ou dano generalizado.

Regras:
- Classifique pelo que domina o lote, não pela melhor peça.
- Se as fotos não mostram o produto com clareza, use confiança abaixo de 0.6.
- is_fit_for_human_consumption = false quando houver podridão, mofo ou contaminação visível.
- Liste defeitos em português simples."""

PEST_PROMPT = """Você apoia produtores de {crop}. Observe as fotos e liste até 3 hipóteses de praga ou doença, \
da mais provável para a menos provável, com os sinais visíveis.
A orientação de manejo deve ser geral (ex.: remover folhas afetadas, melhorar ventilação). Nunca indique \
agrotóxico, princípio ativo ou dose. Marque should_contact_technician quando houver risco de espalhar na lavoura \
ou quando a confiança for baixa."""


class ClaudeVisionClassifier(ImageClassifier):
    """Classificação com Claude Vision via Amazon Bedrock e saída estruturada validada por Pydantic."""

    name = "claude-vision"

    def __init__(self, settings: VisionSettings) -> None:
        self._client = AnthropicBedrockMantle(aws_region=settings.bedrock_region)
        self._model_id = settings.claude_model_id

    def assess_quality(self, crop: str, box_weight_kg: float, images: list[NormalizedImage]) -> QualityAssessment:
        return self._ask(
            QUALITY_RUBRIC.format(crop=crop, box_weight_kg=box_weight_kg),
            images,
            QualityAssessment,
        )

    def diagnose_pests(self, crop: str, images: list[NormalizedImage]) -> PestAssessment:
        return self._ask(PEST_PROMPT.format(crop=crop), images, PestAssessment)

    def _ask[OutputModel](self, instructions: str, images: list[NormalizedImage], output_model: type[OutputModel]) -> OutputModel:
        image_blocks = [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": image.media_type,
                    "data": base64.b64encode(image.content).decode("ascii"),
                },
            }
            for image in images
        ]
        response = self._client.messages.parse(
            model=self._model_id,
            max_tokens=4000,
            output_config={"effort": "low"},
            messages=[{"role": "user", "content": [*image_blocks, {"type": "text", "text": instructions}]}],
            output_format=output_model,
        )
        if response.stop_reason == "refusal" or response.parsed_output is None:
            raise ClassifierUnavailableError("O classificador não retornou uma avaliação para estas fotos")
        return response.parsed_output


class ClassifierUnavailableError(RuntimeError):
    pass
