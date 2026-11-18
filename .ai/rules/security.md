---
area: security
title: Segurança
paths: ["**/auth/**", "**/security/**", "**/*{auth,permission,crypto,token}*"]
keywords: [seguranc, autentic, autoriz, login, senha, password, jwt, access token, refresh token, oauth, segredo, secret, criptograf, permiss, cors, csrf, xss, injection, vulnerab]
skills: [claude:security-review, bmad-code-review]
---
<!-- Regras não negociáveis. O que precisa ser garantido sempre vira bloqueio em .claude/settings.json, não texto. -->
- Nunca leia, imprima, logue ou commite segredos; eles vêm do ambiente.
- Toda entrada externa é validada no servidor; consultas usam parâmetros, nunca concatenação.
- Mudanças em autenticação ou permissão pedem review humano.
