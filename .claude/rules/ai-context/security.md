---
paths:
  - "**/auth/**"
  - "**/security/**"
  - "**/*{auth,permission,crypto,token}*"
---
<!-- ai-context: gerado por `./ai sync` a partir de .ai/rules/security.md — edite lá -->
# Segurança

- Nunca leia, imprima, logue ou commite segredos; eles vêm do ambiente.
- Toda entrada externa é validada no servidor; consultas usam parâmetros, nunca concatenação.
- Mudanças em autenticação ou permissão pedem review humano.

Skills disponíveis para esta área: security-review, bmad-code-review
