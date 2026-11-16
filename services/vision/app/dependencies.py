from functools import lru_cache

from app.classifiers.base_classifier import ImageClassifier
from app.classifiers.claude_vision_classifier import ClaudeVisionClassifier
from app.classifiers.simulated_classifier import SimulatedClassifier
from app.services.image_normalizer import ImageNormalizer
from app.services.pest_diagnosis_service import PestDiagnosisService
from app.services.photo_downloader import PhotoDownloader
from app.services.quality_classifier_service import QualityClassifierService
from app.settings import get_vision_settings


@lru_cache
def get_image_classifier() -> ImageClassifier:
    settings = get_vision_settings()
    if settings.classifier_backend == "claude":
        return ClaudeVisionClassifier(settings)
    return SimulatedClassifier()


@lru_cache
def get_quality_classifier_service() -> QualityClassifierService:
    settings = get_vision_settings()
    return QualityClassifierService(PhotoDownloader(settings), ImageNormalizer(settings), get_image_classifier())


@lru_cache
def get_pest_diagnosis_service() -> PestDiagnosisService:
    settings = get_vision_settings()
    return PestDiagnosisService(PhotoDownloader(settings), ImageNormalizer(settings), get_image_classifier())
