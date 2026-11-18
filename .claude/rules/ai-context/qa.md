---
paths:
  - "**/*.{test,spec}.*"
  - "**/{test,tests,__tests__,e2e,spec}/**"
  - "**/src/test/**"
  - "**/*_test.{go,py,rs}"
  - "**/test_*.py"
  - "**/*Test.{java,kt}"
  - "**/*_spec.rb"
---
<!-- ai-context: gerado por `./ai sync` a partir de .ai/rules/qa.md — edite lá -->
# QA e testes

- Bug corrigido ganha um teste que falhava antes da correção.
- Testes não dependem de rede externa nem de ordem de execução.

Skills disponíveis para esta área: bmad-qa-generate-e2e-tests, bmad-code-review
