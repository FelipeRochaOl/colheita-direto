# 05 · Visão computacional (`services/vision`, FastAPI)

Padrão: classes de serviço, Pydantic para todos os contratos, classificadores trocáveis atrás de `ImageClassifier`.

## MVP
- [x] Projeto FastAPI com `routes/`, `schemas/`, `services/`, `classifiers/`, `settings.py` (Pydantic Settings) — **Pronto quando:** `/health` e `/docs` no ar em ECS
- [x] Contratos Pydantic: `QualityClassificationRequest` (URLs S3, cultura) → `QualityClassificationResponse` (`grade`, `confidence`, `defects[]`, `estimated_weight_kg`) — **Pronto quando:** tipos espelhados em `packages/contracts`
- [ ] `ClaudeVisionClassifier` (Bedrock) com rubrica de classificação por cultura (tomate, folhosas, banana) e saída estruturada — **Pronto quando:** retorna JSON válido em 100% das chamadas de teste _(implementado, falta verificar)_
- [x] Regra de baixa confiança (< limiar → confirmação humana) — **Pronto quando:** lote vai para `NEEDS_REVIEW`
- [ ] Coleta de dados para treino: toda foto + classificação + correção humana salva com consentimento — **Pronto quando:** dataset cresce a cada lote do piloto
- [x] Remoção de EXIF/GPS das imagens armazenadas — **Pronto quando:** teste confirma metadados removidos

## v1
- [ ] Rotulagem com a cooperativa (ferramenta de anotação) e guia de classes A–D por cultura — **Pronto quando:** ≥ 2.000 imagens rotuladas por cultura do piloto
- [ ] Treino de modelo próprio (ex.: EfficientNet/YOLO) em `training/`, com datasets públicos de doenças de plantas para pragas — **Pronto quando:** métricas registradas (acurácia, F1 por classe, matriz de confusão)
- [ ] `TrainedModelClassifier` servido no ECS (ou SageMaker endpoint) — **Pronto quando:** troca de classificador por configuração, sem mudar a API
- [ ] Comparação Claude Vision × modelo próprio (precisão, custo, latência) — **Pronto quando:** decisão documentada por cultura
- [ ] **Diagnóstico de pragas/doenças** (`POST /pests/diagnose`) com top-3 hipóteses e orientação — **Pronto quando:** ≥ 80% de acerto top-3 no conjunto de validação
- [ ] Estimativa de volume/peso por foto (caixa padrão como referência) — **Pronto quando:** erro médio < 15%

## Escala
- [ ] Monitoramento de drift (distribuição de classes e confiança por região/safra) — **Pronto quando:** alerta quando confiança média cai
- [ ] Re-treino periódico com dados novos — **Pronto quando:** pipeline mensal automatizado
- [ ] Novas culturas por configuração (rubrica + modelo) — **Pronto quando:** nova cultura entra sem mudar código
