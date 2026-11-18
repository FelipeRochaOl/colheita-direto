---
area: back
title: Arquitetura back-end
paths: ["**/{server,api,backend,services,service}/**", "**/src/main/**", "**/cmd/**", "**/internal/**", "**/app/{models,controllers,services}/**"]
keywords: [backend, api, endpoint, servico, controller, banco de dados, migracao, fila, schema]
skills: [bmad-architecture]
---
<!-- Módulos, camadas, contratos de API, banco e mensageria. -->
- Regras de negócio ficam em serviços, não em controllers/handlers.
- Toda mudança de contrato de API é compatível com clientes existentes ou versionada.
- Migrações de banco são reversíveis.
