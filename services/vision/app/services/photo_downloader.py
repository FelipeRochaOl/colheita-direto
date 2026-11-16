import httpx
from pydantic import HttpUrl

from app.services.image_normalizer import InvalidPhotoError
from app.settings import VisionSettings


class PhotoDownloader:
    """Baixa as fotos pelas URLs assinadas do S3 geradas pela API."""

    def __init__(self, settings: VisionSettings) -> None:
        self._max_photo_bytes = settings.max_photo_bytes

    def download_all(self, photo_urls: list[HttpUrl]) -> list[bytes]:
        with httpx.Client(timeout=20) as http_client:
            return [self._download(http_client, str(photo_url)) for photo_url in photo_urls]

    def _download(self, http_client: httpx.Client, photo_url: str) -> bytes:
        response = http_client.get(photo_url)
        if response.status_code != 200:
            raise InvalidPhotoError(f"Não foi possível baixar a foto ({response.status_code})")
        if len(response.content) > self._max_photo_bytes:
            raise InvalidPhotoError("Foto maior que o limite permitido")
        return response.content
