from typing import Literal

from pydantic import BaseModel, Field, HttpUrl

QualityGrade = Literal["A", "B", "C", "D"]


class QualityClassificationRequest(BaseModel):
    """Pedido de classificação de um lote. Contrato espelhado em packages/contracts (lotClassificationSchema)."""

    crop: str = Field(min_length=2, examples=["tomate"])
    photo_urls: list[HttpUrl] = Field(min_length=1, max_length=5)
    box_weight_kg: float = Field(gt=0, examples=[20])


class QualityAssessment(BaseModel):
    """Saída estruturada pedida ao classificador (sem campos de infraestrutura)."""

    grade: QualityGrade = Field(description="A padrão comercial; B defeito estético leve; C fora de padrão mas próprio para consumo/indústria; D impróprio para venda")
    confidence: float = Field(ge=0, le=1)
    defects: list[str] = Field(description="Defeitos visíveis, em português, ex.: 'manchas', 'amassados', 'tamanho irregular'")
    estimated_weight_kg: float | None = Field(description="Peso estimado do conteúdo visível, se for possível estimar")
    is_fit_for_human_consumption: bool


class QualityClassificationResponse(BaseModel):
    grade: QualityGrade
    confidence: float
    defects: list[str]
    estimated_weight_kg: float | None
    is_fit_for_human_consumption: bool
    classifier_name: str
