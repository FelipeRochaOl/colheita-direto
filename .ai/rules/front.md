---
area: front
title: Arquitetura front-end
paths: ["**/{web,frontend,client,site}/**", "**/src/{app,pages,routes,hooks,store,stores}/**"]
keywords: [frontend, rota, estado global, hook, react, vue, angular, svelte, next, vite]
skills: [bmad-architecture]
---
<!-- Camadas, gerenciamento de estado, chamadas de API e convenções do front. -->
- Chamadas de API passam por um único cliente; componentes não chamam fetch direto.
- Estado global só para o que é realmente compartilhado.
