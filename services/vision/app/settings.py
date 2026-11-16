from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class VisionSettings(BaseSettings):
    """Configuração do serviço de visão, lida das variáveis de ambiente."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    classifier_backend: Literal["claude", "simulated"] = "simulated"
    bedrock_region: str = "us-east-1"
    claude_model_id: str = "anthropic.claude-opus-5-5"
    max_image_side_pixels: int = 1568
    max_photo_bytes: int = 10_000_000


@lru_cache
def get_vision_settings() -> VisionSettings:
    return VisionSettings()
