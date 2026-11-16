from abc import ABC, abstractmethod

from app.schemas.pest_schemas import PestAssessment
from app.schemas.quality_schemas import QualityAssessment
from app.services.image_normalizer import NormalizedImage


class ImageClassifier(ABC):
    """Interface comum dos classificadores. Trocar Claude Vision por um modelo próprio = trocar esta classe."""

    name: str

    @abstractmethod
    def assess_quality(self, crop: str, box_weight_kg: float, images: list[NormalizedImage]) -> QualityAssessment: ...

    @abstractmethod
    def diagnose_pests(self, crop: str, images: list[NormalizedImage]) -> PestAssessment: ...
