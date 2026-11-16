from app.classifiers.base_classifier import ImageClassifier
from app.schemas.pest_schemas import PestDiagnosisRequest, PestDiagnosisResponse
from app.services.image_normalizer import ImageNormalizer
from app.services.photo_downloader import PhotoDownloader


class PestDiagnosisService:
    """Diagnóstico de pragas e doenças por foto, com top-3 hipóteses e orientação geral de manejo."""

    def __init__(self, photo_downloader: PhotoDownloader, image_normalizer: ImageNormalizer, classifier: ImageClassifier) -> None:
        self._photo_downloader = photo_downloader
        self._image_normalizer = image_normalizer
        self._classifier = classifier

    def diagnose(self, request: PestDiagnosisRequest) -> PestDiagnosisResponse:
        raw_photos = self._photo_downloader.download_all(request.photo_urls)
        images = [self._image_normalizer.normalize(raw_photo) for raw_photo in raw_photos]
        assessment = self._classifier.diagnose_pests(request.crop, images)
        return PestDiagnosisResponse(**assessment.model_dump(), classifier_name=self._classifier.name)
