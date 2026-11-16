from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.classifiers.claude_vision_classifier import ClassifierUnavailableError
from app.dependencies import get_quality_classifier_service
from app.schemas.quality_schemas import QualityClassificationRequest, QualityClassificationResponse
from app.services.image_normalizer import InvalidPhotoError
from app.services.quality_classifier_service import QualityClassifierService

quality_router = APIRouter(prefix="/quality", tags=["Qualidade"])


@quality_router.post("/classify", response_model=QualityClassificationResponse)
def classify_quality(
    request: QualityClassificationRequest,
    quality_classifier_service: Annotated[QualityClassifierService, Depends(get_quality_classifier_service)],
) -> QualityClassificationResponse:
    try:
        return quality_classifier_service.classify(request)
    except InvalidPhotoError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except ClassifierUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
