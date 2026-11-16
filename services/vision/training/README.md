# Treino do modelo próprio (v1)

No MVP a classificação usa Claude Vision (`classifier_backend=claude`). Cada foto classificada e
corrigida pela cooperativa vira dado rotulado. Com ~2.000 imagens por cultura:

1. Exportar fotos + classe final (A–D) do MongoDB/S3.
2. Treinar um classificador de imagens (ex.: EfficientNet) e medir acurácia e F1 por classe.
3. Implementar `TrainedModelClassifier(ImageClassifier)` em `app/classifiers/` — a API não muda.
4. Comparar com Claude Vision (precisão, custo por foto, latência) e decidir por cultura.

Ver `docs/checklists/05-visao-computacional.md`.
