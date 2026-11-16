import hashlib

from app.classifiers.base_classifier import ImageClassifier
from app.schemas.pest_schemas import PestAssessment, PestHypothesis
from app.schemas.quality_schemas import QualityAssessment
from app.services.image_normalizer import NormalizedImage

SIMULATED_DEFECTS = {
    "A": [],
    "B": ["pequenas manchas", "tamanho irregular"],
    "C": ["amassados", "maturação avançada"],
    "D": ["podridão", "mofo"],
}


class SimulatedClassifier(ImageClassifier):
    """
    Classificador de desenvolvimento: resultado determinístico a partir do conteúdo das fotos.
    Permite rodar o fluxo completo sem credenciais AWS. Nunca usar em produção.
    """

    name = "simulated"

    def assess_quality(self, crop: str, box_weight_kg: float, images: list[NormalizedImage]) -> QualityAssessment:
        grade = "ABCD"[self._fingerprint(images) % 4]
        return QualityAssessment(
            grade=grade,
            confidence=0.85,
            defects=SIMULATED_DEFECTS[grade],
            estimated_weight_kg=None,
            is_fit_for_human_consumption=grade != "D",
        )

    def diagnose_pests(self, crop: str, images: list[NormalizedImage]) -> PestAssessment:
        return PestAssessment(
            hypotheses=[
                PestHypothesis(
                    name="mancha-bacteriana (simulado)",
                    probability=0.6,
                    visible_signs=["manchas escuras nas folhas"],
                    management_guidance="Remova as folhas afetadas e evite molhar a folhagem.",
                )
            ],
            is_plant_visible=True,
            should_contact_technician=True,
        )

    @staticmethod
    def _fingerprint(images: list[NormalizedImage]) -> int:
        digest = hashlib.sha256(b"".join(image.content for image in images)).digest()
        return digest[0]
