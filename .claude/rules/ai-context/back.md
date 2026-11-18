---
paths:
  - "**/{server,api,backend,services,service}/**"
  - "**/src/main/**"
  - "**/cmd/**"
  - "**/internal/**"
  - "**/app/{models,controllers,services}/**"
---
<!-- ai-context: gerado por `./ai sync` a partir de .ai/rules/back.md — edite lá -->
# Arquitetura back-end

- Regras de negócio ficam em serviços, não em controllers/handlers.
- Toda mudança de contrato de API é compatível com clientes existentes ou versionada.
- Migrações de banco são reversíveis.

Skills disponíveis para esta área: bmad-architecture
