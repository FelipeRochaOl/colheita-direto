import io

from fastapi.testclient import TestClient
from PIL import Image

from app.dependencies import get_quality_classifier_service
from app.classifiers.simulated_classifier import SimulatedClassifier
from app.main import app
from app.services.image_normalizer import ImageNormalizer
from app.services.quality_classifier_service import QualityClassifierService
from app.settings import VisionSettings


def build_test_photo(color: tuple[int, int, int]) -> bytes:
    output = io.BytesIO()
    Image.new("RGB", (3000, 2000), color).save(output, format="PNG")
    return output.getvalue()


class InMemoryPhotoDownloader:
    def __init__(self, photos: list[bytes]) -> None:
        self._photos = photos

    def download_all(self, photo_urls):
        return self._photos[: len(photo_urls)]


def test_classify_returns_grade_and_classifier_name():
    settings = VisionSettings()
    service = QualityClassifierService(
        InMemoryPhotoDownloader([build_test_photo((200, 30, 30))]), ImageNormalizer(settings), SimulatedClassifier()
    )
    app.dependency_overrides[get_quality_classifier_service] = lambda: service
    client = TestClient(app)

    response = client.post(
        "/quality/classify",
        json={"crop": "tomate", "photo_urls": ["https://example.com/a.jpg"], "box_weight_kg": 20},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["grade"] in {"A", "B", "C", "D"}
    assert body["classifier_name"] == "simulated"
    app.dependency_overrides.clear()


def test_rejects_request_without_photos():
    client = TestClient(app)
    response = client.post("/quality/classify", json={"crop": "tomate", "photo_urls": [], "box_weight_kg": 20})
    assert response.status_code == 422


def test_normalizer_shrinks_image_and_strips_metadata():
    normalized = ImageNormalizer(VisionSettings()).normalize(build_test_photo((10, 120, 10)))
    image = Image.open(io.BytesIO(normalized.content))
    assert max(image.size) <= 1568
    assert normalized.media_type == "image/jpeg"
    assert not image.info.get("exif")
