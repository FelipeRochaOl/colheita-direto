# Colheita Direta

Marketplace direto do produtor rural. O produtor fotografa a colheita, a **visão computacional** classifica a qualidade (A–D) e a plataforma leva cada lote ao destino certo:
- **A/B:** venda com preço sugerido.
- **C:** indústria.
- **D:** doação para ONGs ou reaproveitamento.

Frete e serviços intermediários entram no pedido, e o pagamento é feito por **Pix com split** (Asaas). O produtor faz tudo pelo **WhatsApp** com um agente **Claude** (Amazon Bedrock), por texto, áudio e foto.

- Concepção do produto (GS2): [`docs/concepcao.md`](docs/concepcao.md)
- Arquitetura e padrões de código: [`docs/arquitetura.md`](docs/arquitetura.md)
- Checklists de execução (o que está pronto e o que falta): [`docs/checklists/`](docs/checklists/README.md)

## Estrutura

```
apps/
  api/        NestJS: main.ts (HTTP) + worker.ts (filas SQS), MongoDB
  web/        Vite + React + React Query + Tailwind + Ant Design
  mobile/     Expo (React Native) para o produtor, offline-first
services/
  vision/     FastAPI + Pydantic: classificação de qualidade e pragas por foto
packages/
  contracts/  schemas zod e tipos compartilhados (API, web e mobile)
  api-client/ cliente HTTP + hooks React Query compartilhados
  design-tokens/ cores, tipografia e tema Ant Design/Tailwind
  ui-web/     componentes web reutilizáveis
  config/     tsconfig compartilhado
infra/
  terraform/  toda a infraestrutura AWS + MongoDB Atlas
```

## Rodar localmente

Pré-requisitos: Node 24, pnpm 9, Docker, [uv](https://docs.astral.sh/uv/) (Python).

```bash
pnpm install
pnpm local:up                      # MongoDB + LocalStack (S3 e SQS); pnpm local:down para parar
pnpm turbo build                   # pacotes compartilhados + API

# Serviço de visão (classificador simulado, sem credenciais)
cd services/vision && cp .env.example .env && uv sync && uv run uvicorn app.main:app --port 8000

# API e worker (cada um num terminal)
cd apps/api && cp .env.example .env
pnpm dev                           # http://localhost:3000  (Swagger em /docs)
pnpm dev:worker                    # classificação, WhatsApp e notificações

# Dados de desenvolvimento: cotações de exemplo + um telefone admin
node dist/scripts/seed-development-data.js +5511900000001

# Web
cd apps/web && cp .env.example .env && pnpm dev   # http://localhost:5173

# Mobile (Expo)
cd apps/mobile && cp .env.example .env && npx expo start
```

**Sem credenciais externas tudo funciona em modo de desenvolvimento:**
- **Código de login (OTP) e notificações:** aparecem no log da API.
- **Pagamento:** usa o gateway simulado. Para confirmar o Pix, chame `POST /webhooks/simulated-payments/:orderId`.
- **Classificação:** é simulada, determinística a partir da imagem. Com `CLASSIFIER_BACKEND=claude` usa o Claude Vision no Bedrock.

## Testes

```bash
pnpm turbo build typecheck test --filter=!@colheita/mobile   # API (26 testes), pacotes e web
pnpm --filter @colheita/mobile typecheck
cd services/vision && uv run pytest
```

## Deploy (AWS)

1. `infra/terraform/environments/dev`: preencha `terraform.tfvars` e `backend.hcl` a partir dos `.example`, depois rode `terraform init -backend-config=backend.hcl && terraform apply`.
2. Preencha no Secrets Manager as chaves do Asaas e da Meta (WhatsApp).
3. Configure no GitHub as variáveis `AWS_DEPLOY_ROLE_ARN`, `API_URL`, `WEB_BUCKET_NAME` e `WEB_DISTRIBUTION_ID`, que vêm dos outputs do Terraform. Cada push na `main` publica a API, o worker, o serviço de visão e o site.
