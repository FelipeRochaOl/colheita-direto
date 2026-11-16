from fastapi import FastAPI

from app.dependencies import get_image_classifier
from app.routes.pest_routes import pest_router
from app.routes.quality_routes import quality_router

app = FastAPI(
    title="Colheita Direta – Visão Computacional",
    description="Classificação de qualidade (A–D) e diagnóstico de pragas por foto",
    version="0.1.0",
)
app.include_router(quality_router)
app.include_router(pest_router)


@app.get("/health", tags=["Saúde"])
def health() -> dict[str, str]:
    return {"status": "ok", "classifier": get_image_classifier().name}
