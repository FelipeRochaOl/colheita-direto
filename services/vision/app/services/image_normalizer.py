import io
from dataclasses import dataclass

from PIL import Image, ImageOps

from app.settings import VisionSettings


@dataclass(frozen=True)
class NormalizedImage:
    content: bytes
    media_type: str


class InvalidPhotoError(ValueError):
    pass


class ImageNormalizer:
    """
    Prepara a foto para o classificador: corrige a rotação, reduz o tamanho (menos custo e latência)
    e regrava em JPEG, o que remove EXIF e GPS (LGPD).
    """

    def __init__(self, settings: VisionSettings) -> None:
        self._max_side_pixels = settings.max_image_side_pixels

    def normalize(self, raw_content: bytes) -> NormalizedImage:
        try:
            image = Image.open(io.BytesIO(raw_content))
            image = ImageOps.exif_transpose(image).convert("RGB")
        except Exception as error:
            raise InvalidPhotoError("Arquivo não é uma imagem válida") from error

        image.thumbnail((self._max_side_pixels, self._max_side_pixels))
        output = io.BytesIO()
        image.save(output, format="JPEG", quality=85)
        return NormalizedImage(content=output.getvalue(), media_type="image/jpeg")
