from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.classifiers.claude_vision_classifier import ClassifierUnavailableError
from app.dependencies import get_pest_diagnosis_service
from app.schemas.pest_schemas import PestDiagnosisRequest, PestDiagnosisResponse
from app.services.image_normalizer import InvalidPhotoError
from app.services.pest_diagnosis_service import PestDiagnosisService

pest_router = APIRouter(prefix="/pests", tags=["Pragas e doenças"])


@pest_router.post("/diagnose", response_model=PestDiagnosisResponse)
def diagnose_pests(
    request: PestDiagnosisRequest,
    pest_diagnosis_service: Annotated[PestDiagnosisService, Depends(get_pest_diagnosis_service)],
) -> PestDiagnosisResponse:
    try:
        return pest_diagnosis_service.diagnose(request)
    except InvalidPhotoError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except ClassifierUnavailableError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
