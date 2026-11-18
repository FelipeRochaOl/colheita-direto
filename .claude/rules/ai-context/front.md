---
paths:
  - "**/{web,frontend,client,site}/**"
  - "**/src/{app,pages,routes,hooks,store,stores}/**"
---
<!-- ai-context: gerado por `./ai sync` a partir de .ai/rules/front.md — edite lá -->
# Arquitetura front-end

- Chamadas de API passam por um único cliente; componentes não chamam fetch direto.
- Estado global só para o que é realmente compartilhado.

Skills disponíveis para esta área: bmad-architecture
