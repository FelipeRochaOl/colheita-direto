from app.classifiers.base_classifier import ImageClassifier
from app.schemas.quality_schemas import QualityClassificationRequest, QualityClassificationResponse
from app.services.image_normalizer import ImageNormalizer
from app.services.photo_downloader import PhotoDownloader


class QualityClassifierService:
    """Fluxo de classificação: baixar fotos → normalizar → classificar."""

    def __init__(self, photo_downloader: PhotoDownloader, image_normalizer: ImageNormalizer, classifier: ImageClassifier) -> None:
        self._photo_downloader = photo_downloader
        self._image_normalizer = image_normalizer
        self._classifier = classifier

    def classify(self, request: QualityClassificationRequest) -> QualityClassificationResponse:
        raw_photos = self._photo_downloader.download_all(request.photo_urls)
        images = [self._image_normalizer.normalize(raw_photo) for raw_photo in raw_photos]
        assessment = self._classifier.assess_quality(request.crop, request.box_weight_kg, images)
        return QualityClassificationResponse(**assessment.model_dump(), classifier_name=self._classifier.name)
