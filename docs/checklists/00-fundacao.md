# 00 · Fundação

## MVP
### Monorepo
- [x] Turborepo + pnpm workspaces com `apps/`, `services/`, `packages/`, `infra/` — **Pronto quando:** `pnpm install && pnpm turbo build` roda limpo na raiz
- [x] `packages/config` com tsconfig base, ESLint, Prettier, Jest — **Pronto quando:** todos os apps estendem a config compartilhada
- [x] Pipelines `build`, `lint`, `typecheck`, `test`, `dev` no `turbo.json` com cache — **Pronto quando:** segunda execução usa cache
- [x] `docker-compose.yml` local (MongoDB, LocalStack para SQS/S3) — **Pronto quando:** `pnpm dev` sobe tudo localmente
- [ ] Convenções: commits convencionais, template de PR, CODEOWNERS — **Pronto quando:** commitlint bloqueia mensagem fora do padrão

### Design system
- [x] `packages/design-tokens` reexportando `@leafygreen-ui/palette` e tipografia — **Pronto quando:** nenhum hex fixo nos apps (regra de lint)
- [x] Preset Tailwind gerado dos tokens — **Pronto quando:** web e mobile (NativeWind) usam o mesmo preset
- [x] Tema Ant Design (`ThemeConfig`) com as cores LeafyGreen — **Pronto quando:** botão/inputs AntD com a cor primária do LeafyGreen
- [x] Tema mobile (`ant-design-mobile-theme.ts`) para `@ant-design/react-native`, gerado dos mesmos tokens — **Pronto quando:** cores idênticas entre web e app
- [x] Convivência Tailwind × Ant Design (preflight vs. estilos AntD: `@layer` + `StyleProvider` ou preflight desativado) — **Pronto quando:** Button/Input/Select do AntD renderizam idênticos com e sem Tailwind (teste visual)
- [x] `packages/ui-web` com os primeiros componentes (MoneyText, StatCard, PageSection, Badge de qualidade A–D) — **Pronto quando:** usados por ≥ 2 telas

### AWS + Terraform
- [ ] Backend de estado remoto (S3 + DynamoDB lock) — **Pronto quando:** `terraform init` em `environments/dev` usa estado remoto
- [ ] Módulos `network`, `ecs-service`, `load-balancer`, `s3-cdn`, `sqs-queue`, `atlas-cluster`, `secrets`, `observability`, `bedrock` — **Pronto quando:** `terraform apply` cria o ambiente dev do zero _(implementado, falta verificar)_
- [ ] Cluster **MongoDB Atlas M0** criado via Terraform (`mongodbatlas`), usuário do banco e IP access list só com o Elastic IP do NAT — **Pronto quando:** API em ECS conecta; conexão de outro IP é recusada _(implementado, falta verificar)_
- [ ] Ambientes `dev` e `prod` em contas AWS separadas (ou OUs) — **Pronto quando:** nenhum recurso prod acessível com credencial dev
- [ ] ECR por serviço e deploy ECS via GitHub Actions com OIDC (sem chave fixa) — **Pronto quando:** merge na `main` publica em dev automaticamente _(implementado, falta verificar)_
- [ ] Domínio, Route 53 e ACM — **Pronto quando:** `api.dev.<dominio>` e `app.dev.<dominio>` com HTTPS
- [ ] WAF no ALB com regras gerenciadas e rate limit — **Pronto quando:** teste de flood é bloqueado _(implementado, falta verificar)_
- [ ] **(verificar)** Claude no Bedrock, Transcribe e Polly pt-BR em `sa-east-1`; se exigir outra região, registrar transferência no mapa LGPD — **Pronto quando:** decisão de região documentada
- [x] Orçamento e alertas de custo (AWS Budgets) — **Pronto quando:** alerta por e-mail em 80% do orçamento

### LGPD e segurança
- [ ] Mapa de dados pessoais (quais, onde, finalidade, retenção) — **Pronto quando:** documento revisado e versionado
- [ ] Termos de uso e política de privacidade; consentimento registrado com data/versão — **Pronto quando:** cadastro não conclui sem aceite
- [ ] Criptografia em repouso (KMS) para S3 e SQS; TLS obrigatório no Atlas — **Pronto quando:** `terraform plan` sem recurso sem criptografia _(implementado, falta verificar)_
- [ ] Secrets Manager para Asaas, Meta e string de conexão do Atlas — **Pronto quando:** nenhum segredo em `.env` versionado (scanner no CI) _(implementado, falta verificar)_

## v1
- [ ] Ambiente `staging` espelhando prod — **Pronto quando:** release passa por staging antes de prod
- [ ] Upgrade do Atlas M0 → M10+ (backups contínuos, PrivateLink com a VPC) ao atingir o gatilho definido em `arquitetura.md` — **Pronto quando:** cluster pago com restore testado
- [ ] Exportação e exclusão de dados do titular (LGPD) — **Pronto quando:** usuário solicita pelo app e recebe em até 15 dias
- [ ] Pentest básico (OWASP Top 10) — **Pronto quando:** sem achados críticos abertos

## Escala
- [ ] Multi-AZ em todos os serviços AWS e Atlas com réplicas em várias zonas — **Pronto quando:** queda de uma AZ não derruba o serviço
- [ ] Plano de recuperação de desastre (RPO/RTO definidos) — **Pronto quando:** simulação executada
