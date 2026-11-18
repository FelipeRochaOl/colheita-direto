---
paths:
  - "**/Dockerfile*"
  - "**/docker-compose*"
  - "**/*.tf"
  - "**/.github/workflows/**"
  - "**/{k8s,helm,deploy,infra,terraform}/**"
  - "**/Makefile"
---
<!-- ai-context: gerado por `./ai sync` a partir de .ai/rules/devops.md — edite lá -->
# DevOps e infraestrutura

- Infra muda por código (IaC); nada de ajuste manual no console sem registrar.
- Pipeline quebrado bloqueia merge.
