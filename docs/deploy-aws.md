# Deploy na AWS e variáveis de ambiente

```bash
pnpm infra:start        # sobe/atualiza o ambiente dev (padrão)
pnpm infra:stop         # derruba o ambiente dev (para de gerar custo)
pnpm infra:start prod   # ambiente de produção
```

`infra:start` faz tudo em sequência:
1. Cria o bucket do estado do Terraform (uma vez por conta).
2. Cria os repositórios ECR.
3. Gera e envia as imagens da API e do serviço de visão.
4. Aplica o Terraform: VPC, ECS, ALB, CloudFront, SQS, S3, MongoDB Atlas, segredos e alarmes.
5. Coloca as imagens no ar.
6. Publica o site no S3 + CloudFront.

No final ele mostra as URLs. `infra:stop` roda `terraform destroy` e pede confirmação digitada; em produção a confirmação é obrigatória mesmo com `--yes`.

---

## 1. Pré-requisitos (uma vez)

| Item | Como conseguir |
|---|---|
| AWS CLI v2, Terraform ≥ 1.10, Docker, jq, pnpm | `brew install awscli terraform jq` · Docker Desktop · `corepack enable` |
| **Usuário IAM do Terraform** | ✅ **Já criado:** usuário `colheita-terraform` (AdministratorAccess) na conta `481873004364`, com o perfil local `colheita-terraform` em `~/.aws/credentials`. Os scripts usam esse perfil por padrão. |
| Conta no MongoDB Atlas | Grátis em <https://www.mongodb.com/cloud/atlas/register> |
| Acesso ao Claude no Bedrock | Ver a variável `BEDROCK_REGION` / `CLAUDE_MODEL_ID` abaixo |

> **Segurança da conta:** depois de confirmar que o `pnpm infra:start` funciona com o perfil `colheita-terraform`, apague as **chaves de acesso do usuário root**. No Console: menu da conta → *Security credentials* → *Access keys* → *Delete*. Ative MFA no root e use o root só para cobrança.

---

## 2. Variáveis do Terraform (`infra/terraform/environments/dev/terraform.tfvars`)

Copie o exemplo: `cp infra/terraform/environments/dev/terraform.tfvars.example infra/terraform/environments/dev/terraform.tfvars`.
O arquivo está no `.gitignore` e não vai para o repositório.

| Variável | Obrigatória | O que é / como pegar |
|---|---|---|
| `atlas_org_id` | sim | ID da organização no Atlas. Em <https://cloud.mongodb.com>: clique no nome da organização (canto superior esquerdo) → **Organization Settings** → copie o **Organization ID** (24 caracteres hexadecimais, ex.: `6745a1b2c3d4e5f6a7b8c9d0`). |
| `alert_email` | sim | Seu e-mail. Recebe alertas de erro (mensagens na DLQ, erros 5xx na API) e de orçamento (80% de US$ 100/mês no dev). **Depois do primeiro `infra:start`, confirme a inscrição no e-mail "AWS Notification - Subscription Confirmation"**, senão os alertas não chegam. |
| `github_repository` | não | `FelipeRochaOl/colheita-direto`, só se for usar o deploy automático pelo GitHub Actions (`.github/workflows/deploy.yml`). Sem ele, o deploy é só pelo `pnpm infra:start`. |
| `web_app_url` | não | Endereço do site com domínio próprio. Vazio = usa o endereço `https://xxxx.cloudfront.net` gerado. |

## 3. Variáveis em `infra/.env` (antes do `pnpm infra:start`)

Copie `infra/.env.example` para `infra/.env` e preencha. O arquivo é ignorado pelo git e os scripts `infra:start`/`infra:stop` o carregam sozinhos. Variáveis já exportadas no terminal também funcionam.

| Variável | Obrigatória | O que é / como pegar |
|---|---|---|
| `MONGODB_ATLAS_CLIENT_ID` | sim | Service Account do Atlas para o Terraform criar o projeto e o cluster M0. Atlas → **Organization Settings** → **Access Manager** → aba **Applications** → **Service Accounts** → **Create Service Account**. Nome: `terraform-colheita`. Permissão: **Organization Project Creator**. O Atlas mostra o *Client ID* (começa com `mdb_sa_id_`). |
| `MONGODB_ATLAS_CLIENT_SECRET` | sim | Na mesma tela. O *Client Secret* (começa com `mdb_sa_sk_`) aparece **uma única vez**: copie na hora. Se a organização exigir lista de IPs para a API, adicione o seu IP na Service Account (**Add Access List Entry** → **Use Current IP Address**). |
| `AWS_PROFILE` | não | Padrão `colheita-terraform` (o usuário IAM criado). Só mude se quiser usar outro perfil. |
| `AWS_REGION` | não | Padrão `sa-east-1` (São Paulo). |

```bash
cp infra/.env.example infra/.env   # depois preencha o client ID e o secret
pnpm infra:start
```

## 4. Segredos no AWS Secrets Manager (depois do primeiro `infra:start`)

O Terraform cria todos os segredos. Três ele preenche sozinho:
- `JWT_SECRET`: aleatório, 64 caracteres.
- `MONGODB_URI`: string do Atlas com usuário e senha gerados.

Os de terceiros nascem **em branco**, e em branco a integração fica desligada: o dev funciona em modo demo, com o código de login no log e o Pix simulado.

Para preencher cada um:

```bash
aws secretsmanager put-secret-value --profile colheita-terraform \
  --secret-id colheita-dev/NOME_DO_SEGREDO --secret-string 'VALOR'
```

Depois rode `pnpm infra:start` de novo para os serviços lerem os valores novos.

| Segredo (`colheita-dev/...`) | Para quê | Como pegar |
|---|---|---|
| `ASAAS_API_KEY` | Cobranças Pix com split | Crie a conta de testes em <https://sandbox.asaas.com>. No menu do usuário → **Integrações** → **Chave de API** → **Gerar chave**. Começa com `$aact_`. Em produção, gere na conta real (<https://www.asaas.com>) e use o ambiente `prod`, que já aponta para `api.asaas.com`. |
| `ASAAS_WEBHOOK_TOKEN` | Garante que o aviso de pagamento veio do Asaas | **Você inventa** um texto longo: `openssl rand -hex 32`. Depois, no Asaas → **Integrações** → **Webhooks** → **Adicionar**: URL = `<API_URL>/webhooks/asaas` (a `API_URL` aparece no final do `infra:start`), versão v3, eventos de **Cobranças** (`PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`) e **Token de autenticação** = o mesmo texto. |
| `WHATSAPP_PHONE_NUMBER_ID` | Número que envia as mensagens | <https://developers.facebook.com> → seu app → **WhatsApp** → **API Setup** (Configuração da API) → **Phone number ID** (só números). No início dá para usar o número de teste que a Meta fornece. |
| `WHATSAPP_ACCESS_TOKEN` | Autoriza o envio pela Graph API | O token temporário da tela API Setup expira em 24 h. Para um token permanente: <https://business.facebook.com> → **Configurações do negócio** → **Usuários** → **Usuários do sistema** → **Adicionar** (função Admin) → **Gerar novo token** → selecione o app → permissões `whatsapp_business_messaging` e `whatsapp_business_management` → expiração **Nunca**. Em **Ativos**, dê ao usuário do sistema acesso ao app e à conta do WhatsApp. *(Pode ser feito por mim pelo MCP da Meta quando ele estiver conectado.)* |
| `WHATSAPP_APP_SECRET` | Valida a assinatura dos webhooks da Meta | developers.facebook.com → seu app → **Configurações do app** → **Básico** → **Chave secreta do app** → **Mostrar**. |
| `WHATSAPP_VERIFY_TOKEN` | Senha da verificação do webhook | **Você inventa** (`openssl rand -hex 16`). Depois: app → **WhatsApp** → **Configuração** → **Webhook** → **Editar**. URL de callback = `<API_URL>/webhooks/whatsapp`; token de verificação = o mesmo texto. Em seguida, **assine o campo `messages`**. |

**Templates do WhatsApp** (necessários para mensagens fora da janela de 24 h). Crie no WhatsApp Manager, em português (`pt_BR`):

| Template | Categoria | Corpo |
|---|---|---|
| `codigo_de_acesso` | Autenticação | Código {{1}} |
| `lote_classificado` | Utilidade | Seu lote de {{1}} ficou classe {{2}}. Sugestão: {{3}}. |
| `novo_pedido` | Utilidade | Novo pedido pago: {{1}}. |
| `doacao_disponivel` | Utilidade | Doação disponível: {{1}}, cerca de {{2}} kg em {{3}}. |

## 5. Claude no Bedrock (classificação real e agente do WhatsApp)

| Configuração | Onde | Como |
|---|---|---|
| Acesso ao modelo | Console AWS → **Amazon Bedrock** → região **N. Virginia (us-east-1)** → **Model access** → **Modify model access** | Marque o **Claude Opus 5.5** (Anthropic) e envie. Na primeira vez a Anthropic pede um formulário de caso de uso, que é aprovado em minutos. |
| `BEDROCK_REGION` | `infra/terraform/modules/platform/variables.tf` (padrão `us-east-1`) | Use a região onde liberou o modelo. *(verificar se já existe em `sa-east-1`. Se usar outra região, os dados saem do Brasil: registre isso no mapa LGPD.)* |
| `CLAUDE_MODEL_ID` | mesmo arquivo (padrão `anthropic.claude-opus-5-5`) | Confira o ID na página do modelo no console do Bedrock. |
| `CLASSIFIER_BACKEND` | ambiente do serviço de visão | Na AWS já é `claude`. Localmente é `simulated` até você ter acesso. |

## 6. `.env` locais (desenvolvimento no seu computador)

Copie cada `.env.example` para `.env`. Todos os `.env` estão no `.gitignore`.

### `apps/api/.env`

| Variável | Valor local | Observação |
|---|---|---|
| `NODE_ENV` | `development` | Em `development`, o código de login e as notificações aparecem no log |
| `PORT` | `3000` | |
| `WEB_APP_URL` | `http://localhost:5173` | Origem liberada no CORS |
| `JWT_SECRET` | qualquer texto com 16+ caracteres | `openssl rand -hex 32` |
| `PRIVACY_POLICY_VERSION` | `2026-11` | Versão registrada no consentimento LGPD |
| `MONGODB_URI` | `mongodb://localhost:27017/colheita-direta` | Para usar o Atlas localmente: Atlas → cluster → **Connect** → **Drivers** e acrescente `/colheita-direta` antes do `?` |
| `AWS_REGION` | `us-east-1` | LocalStack |
| `AWS_ENDPOINT_URL` | `http://localhost:4566` | LocalStack. **Remova** para usar a AWS de verdade |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | `test` / `test` | Só para o LocalStack. Na AWS, a task ECS usa IAM role (sem chave) |
| `HARVEST_PHOTOS_BUCKET` | `colheita-direta-harvest-photos` | Criado pelo `pnpm local:up` |
| `HARVEST_LOT_EVENTS_QUEUE_URL` | `http://localhost:4566/000000000000/harvest-lot-events` | |
| `NOTIFICATION_EVENTS_QUEUE_URL` | `http://localhost:4566/000000000000/notification-events` | |
| `VISION_SERVICE_URL` | `http://localhost:8000` | |
| `BEDROCK_REGION` / `CLAUDE_MODEL_ID` | `us-east-1` / `anthropic.claude-opus-5-5` | Para o agente funcionar localmente, rode a API com um perfil AWS que tenha acesso ao Bedrock (ex.: `AWS_PROFILE=colheita-terraform`) e **sem** as chaves `test` |
| `ASAAS_API_URL` | `https://api-sandbox.asaas.com/v3` | |
| `ASAAS_API_KEY` | vazio | Vazio = Pix simulado (`POST /webhooks/simulated-payments/:orderId`) |
| `ASAAS_WEBHOOK_TOKEN` | vazio | |
| `ASAAS_PLATFORM_FEE_PERCENT` | `8` | Taxa da plataforma sobre os produtos |
| `WHATSAPP_*` (5 variáveis) | vazio | Vazio = mensagens só no log. Mesmos valores da seção 4 |
| `SMS_ENABLED` | `false` | `true` envia SMS pelo Amazon SNS (exige saída do sandbox de SMS da AWS) |

### `services/vision/.env`

| Variável | Valor | Observação |
|---|---|---|
| `CLASSIFIER_BACKEND` | `simulated` ou `claude` | `claude` exige acesso ao Bedrock e credenciais AWS no terminal |
| `BEDROCK_REGION` | `us-east-1` | |
| `CLAUDE_MODEL_ID` | `anthropic.claude-opus-5-5` | |
| `MAX_IMAGE_SIDE_PIXELS` | `1568` | Fotos maiores são reduzidas antes de ir ao modelo |
| `MAX_PHOTO_BYTES` | `10000000` | |

### `apps/web/.env`

| Variável | Valor |
|---|---|
| `VITE_API_URL` | `http://localhost:3000`. Na AWS, o `infra:start` injeta a URL HTTPS da API sozinho |

### `apps/mobile/.env`

| Variável | Valor |
|---|---|
| `EXPO_PUBLIC_API_URL` | No celular físico, `http://IP_DO_SEU_COMPUTADOR:3000` (veja com `ipconfig getifaddr en0`). Com a API na AWS, use a `API_URL` do `infra:start`. |

## 7. Custo estimado (dev ligado 24 h)

Valores aproximados para `sa-east-1`. **Confira na [calculadora da AWS](https://calculator.aws/).**

| Recurso | ≈ US$/mês |
|---|---|
| NAT Gateway (IP fixo liberado no Atlas) | 45 |
| Load Balancer | 22 |
| Fargate (api-http, api-worker, vision) | 70 |
| WAF, CloudFront, S3, SQS, Secrets, logs | 15 |
| MongoDB Atlas M0 | 0 |
| Bedrock (Claude) | por uso |
| **Total** | **≈ US$ 150/mês ≈ US$ 5/dia** |

**Para a GS:** suba para gravar o vídeo e rode `pnpm infra:stop` em seguida. O alerta de orçamento avisa ao chegar a 80% de US$ 100.

## 8. Problemas comuns

| Sintoma | Causa provável |
|---|---|
| `401/403` do provider `mongodbatlas` | IP fora da API Access List da chave, ou chave sem a permissão *Organization Project Creator* |
| Erro criando cluster M0 na região | M0 indisponível em `SA_EAST_1`: troque `atlas_region` em `modules/atlas-cluster/variables.tf` (ex.: `US_EAST_1`) |
| Serviços ECS reiniciando | Veja os logs: CloudWatch → *Log groups* → `/ecs/colheita-dev/...` |
| Webhook da Meta não verifica | `WHATSAPP_VERIFY_TOKEN` diferente nos dois lados, ou o serviço ainda não leu o segredo (rode `infra:start` de novo) |
| Classificação não sai do "Classificando…" | Worker ou visão fora do ar, ou sem acesso ao modelo no Bedrock. Veja os logs `api-worker` e `vision` |
