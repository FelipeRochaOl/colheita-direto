---
area: qa
title: QA e testes
paths: ["**/*.{test,spec}.*", "**/{test,tests,__tests__,e2e,spec}/**", "**/src/test/**", "**/*_test.{go,py,rs}", "**/test_*.py", "**/*Test.{java,kt}", "**/*_spec.rb"]
keywords: [teste, test, cobertura, e2e, regressao, bug, qa, mock, fixture, flaky]
skills: [bmad-qa-generate-e2e-tests, bmad-code-review]
---
<!-- Pirâmide de testes, onde ficam, como rodar e o que é obrigatório por nível de risco (.ai/policy.yaml). -->
- Bug corrigido ganha um teste que falhava antes da correção.
- Testes não dependem de rede externa nem de ordem de execução.
