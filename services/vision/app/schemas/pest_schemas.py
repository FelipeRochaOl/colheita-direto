from pydantic import BaseModel, Field, HttpUrl


class PestDiagnosisRequest(BaseModel):
    crop: str = Field(min_length=2)
    photo_urls: list[HttpUrl] = Field(min_length=1, max_length=3)


class PestHypothesis(BaseModel):
    name: str = Field(description="Nome popular da praga ou doença")
    probability: float = Field(ge=0, le=1)
    visible_signs: list[str]
    management_guidance: str = Field(description="Orientação de manejo geral, sem indicar produto ou dose")


class PestAssessment(BaseModel):
    hypotheses: list[PestHypothesis] = Field(max_length=3)
    is_plant_visible: bool
    should_contact_technician: bool


class PestDiagnosisResponse(PestAssessment):
    classifier_name: str
