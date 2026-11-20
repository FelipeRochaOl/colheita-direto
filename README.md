# Colheita Direta

Marketplace direto do produtor rural. O produtor fotografa a colheita, a **visão computacional** classifica a qualidade (A–D) e a plataforma leva cada lote ao destino certo:
- **A/B:** venda com preço sugerido.
- **C:** indústria.
- **D:** doação para ONGs ou reaproveitamento.

Frete e serviços intermediários entram no pedido, e o pagamento é feito por **Pix com split** (Asaas). O produtor faz tudo pelo **WhatsApp** com um agente **Claude** (Amazon Bedrock), por texto, áudio e foto.

Roteiro do vídeo-pitch (GS2, até 5 min): [`PITCH.md`](PITCH.md).

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

Todos os comandos abaixo rodam **na raiz do repositório**, cada serviço num terminal.

```bash
pnpm install
pnpm local:up                      # MongoDB + LocalStack (S3 e SQS); pnpm local:down para parar
pnpm build                         # pacotes compartilhados, API e web

# Variáveis de ambiente (só na primeira vez)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env
cp services/vision/.env.example services/vision/.env

# Serviço de visão (classificador simulado, sem credenciais)
cd services/vision && uv sync && uv run uvicorn app.main:app --port 8000

# API e worker
pnpm --filter @colheita/api dev          # http://localhost:3000  (Swagger em /docs)
pnpm --filter @colheita/api dev:worker   # classificação, WhatsApp e notificações

# Dados de demonstração (APAGA o banco local): 8 produtores com fotos reais, 11 ofertas,
# compradores, pedidos pagos e uma doação. Lista os telefones para entrar no fim.
pnpm --filter @colheita/api seed:demo -- --reset
# Se as fotos sumirem do S3 local (ex.: LocalStack reiniciado):
pnpm --filter @colheita/api photos:restore
# Ou só cotações de exemplo + um telefone admin, sem apagar nada:
cd apps/api && node --env-file=.env dist/scripts/seed-development-data.js +5511900000001

# Web
pnpm --filter @colheita/web dev          # http://localhost:5173

# Mobile (Expo Go)
pnpm --filter @colheita/mobile start     # Metro; aperte i (iOS) ou a (Android)
pnpm --filter @colheita/mobile ios       # abre direto no simulador do iOS
pnpm --filter @colheita/mobile android   # abre direto no emulador Android
pnpm --filter @colheita/mobile start -c  # limpa o cache (após mudar o .env)
```

**Mobile:** no simulador, `EXPO_PUBLIC_API_URL=http://localhost:3000` funciona. No celular físico, use o IP da máquina na rede (ex.: `http://192.168.0.10:3000`). Para o simulador do iOS é preciso o Xcode com um simulador instalado (**Xcode → Settings → Platforms**).

**Sem credenciais externas tudo funciona em modo de desenvolvimento:**
- **Código de login (OTP) e notificações:** aparecem no log da API.
- **Pagamento:** usa o gateway simulado. Para confirmar o Pix, chame `POST /webhooks/simulated-payments/:orderId`.
- **Classificação:** é simulada, determinística a partir da imagem. Com `CLASSIFIER_BACKEND=claude` usa o Claude Vision no Bedrock.

## Testes

```bash
pnpm build && pnpm typecheck      # todos os pacotes e apps, inclusive mobile
pnpm test                          # testes da API (Jest)
cd services/vision && uv run pytest
```

## Deploy (AWS)

1. Preencha `infra/terraform/environments/dev/terraform.tfvars` a partir do `.example` e rode `pnpm infra:start`. O script cria o bucket de estado do Terraform, publica as imagens, a API e o site. Para apagar tudo: `pnpm infra:stop`. As variáveis estão descritas em `infra/terraform/environments/dev/variables.tf`.
2. Preencha no Secrets Manager as chaves do Asaas e da Meta (WhatsApp).
3. (Opcional) Configure no GitHub as variáveis `AWS_DEPLOY_ROLE_ARN`, `API_URL`, `WEB_BUCKET_NAME` e `WEB_DISTRIBUTION_ID`, que vêm dos outputs do Terraform. Cada push na `main` publica a API, o worker, o serviço de visão e o site.

Para entrar: a conta "Ana Lima" deixou de existir, embora a sessão antiga ainda apareça no cabeçalho até você clicar em Sair. Para os testes e o vídeo:

| Perfil                  | Conta                                                                           | Telefone        |
| ----------------------- | ------------------------------------------------------------------------------- | --------------- |
| Produtor                | João da Silva                                                                   | (11) 90000-0101 |
| Comprador (restaurante) | Restaurante Sabor da Terra                                                      | (11) 90000-0201 |
| Comprador (mercado)     | Mercado Bom Preço                                                               | (11) 90000-0202 |
| Consumidor              | Carla Mendes                                                                    | (11) 90000-0203 |
| ONG                     | Banco de Alimentos Alto Tietê                                                   | (11) 90000-0301 |
| Transportadora          | Fretes Alto Tietê (frete R$ 35 de saída + R$ 2,20/km, câmara fria, raio 200 km) | (11) 90000-0401 |
| Prestador de serviço    | Agro Serviços Mogi (embalagem, classificação, assistência técnica, raio 80 km)  | (11) 90000-0402 |

Essas contas são criadas pelo `pnpm --filter @colheita/api seed:demo -- --reset` (ver acima), que **apaga o banco local** antes de recriar tudo. O código de login aparece no log da API. Transportadora e prestador já vêm aprovados e com preços divulgados: entre em **Meus serviços** para editar e responder solicitações; como produtor, contrate na aba **Frete e serviços** de **Minha produção**.
