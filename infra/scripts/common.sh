#!/usr/bin/env bash
# Funções compartilhadas por infra-start.sh e infra-stop.sh.
set -euo pipefail

REPOSITORY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TERRAFORM_ROOT="$REPOSITORY_ROOT/infra/terraform"

print_step() { printf '\n\033[1;32m▶ %s\033[0m\n' "$1"; }
print_warning() { printf '\033[1;33m⚠ %s\033[0m\n' "$1"; }
fail() { printf '\033[1;31m✖ %s\033[0m\n' "$1" >&2; exit 1; }

# Variáveis locais da infra (chaves do Atlas etc.). O arquivo é ignorado pelo git.
INFRA_ENV_FILE="$REPOSITORY_ROOT/infra/.env"
if [[ -f "$INFRA_ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$INFRA_ENV_FILE"
  set +a
fi

parse_arguments() {
  ENVIRONMENT="dev"
  SKIP_CONFIRMATION="false"
  for argument in "$@"; do
    case "$argument" in
      dev | prod) ENVIRONMENT="$argument" ;;
      --yes) SKIP_CONFIRMATION="true" ;;
      *) fail "Argumento desconhecido: $argument (use: dev | prod | --yes)" ;;
    esac
  done
  ENVIRONMENT_DIRECTORY="$TERRAFORM_ROOT/environments/$ENVIRONMENT"
  AWS_REGION="${AWS_REGION:-sa-east-1}"
  # Usuário IAM dedicado ao Terraform (não usar o root). Troque com AWS_PROFILE=outro pnpm infra:start
  AWS_PROFILE="${AWS_PROFILE:-colheita-terraform}"
  export AWS_REGION AWS_PROFILE
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando '$1' não encontrado. $2"
}

check_prerequisites() {
  print_step "Verificando pré-requisitos"
  require_command aws "Instale o AWS CLI v2."
  require_command terraform "Instale o Terraform >= 1.10."
  require_command jq "Instale o jq (brew install jq)."
  # Service Account (recomendado) ou, alternativa, chave de API programática antiga.
  [[ ( -n "${MONGODB_ATLAS_CLIENT_ID:-}" && -n "${MONGODB_ATLAS_CLIENT_SECRET:-}" ) \
    || ( -n "${MONGODB_ATLAS_PUBLIC_API_KEY:-}" && -n "${MONGODB_ATLAS_PRIVATE_API_KEY:-}" ) ]] \
    || fail "Defina MONGODB_ATLAS_CLIENT_ID e MONGODB_ATLAS_CLIENT_SECRET em infra/.env (copie de infra/.env.example)."
  [[ -f "$ENVIRONMENT_DIRECTORY/terraform.tfvars" ]] \
    || fail "Crie $ENVIRONMENT_DIRECTORY/terraform.tfvars a partir do terraform.tfvars.example."

  AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)" \
    || fail "Sem credenciais AWS válidas. Rode 'aws configure' ou defina AWS_PROFILE."
  AWS_CALLER_ARN="$(aws sts get-caller-identity --query Arn --output text)"
  echo "Conta AWS: $AWS_ACCOUNT_ID"
  echo "Identidade: $AWS_CALLER_ARN"
  echo "Perfil: ${AWS_PROFILE:-default} | Região: $AWS_REGION | Ambiente: $ENVIRONMENT"
  if [[ "$AWS_CALLER_ARN" == *":root" ]]; then
    print_warning "Você está usando o usuário root da conta. Prefira um usuário IAM ou SSO com permissão de administrador."
  fi
  TERRAFORM_STATE_BUCKET="colheita-direta-tfstate-$AWS_ACCOUNT_ID"
}

confirm() {
  local question="$1" expected_answer="$2"
  if [[ "$SKIP_CONFIRMATION" == "true" ]]; then return; fi
  read -r -p "$question Digite '$expected_answer' para continuar: " answer
  [[ "$answer" == "$expected_answer" ]] || fail "Cancelado."
}

terraform_init() {
  print_step "Inicializando o Terraform (estado em s3://$TERRAFORM_STATE_BUCKET)"
  terraform -chdir="$ENVIRONMENT_DIRECTORY" init -input=false -reconfigure \
    -backend-config="bucket=$TERRAFORM_STATE_BUCKET" \
    -backend-config="key=colheita-direta/$ENVIRONMENT/terraform.tfstate" \
    -backend-config="region=$AWS_REGION" \
    -backend-config="use_lockfile=true" \
    -backend-config="encrypt=true" >/dev/null
}

terraform_output() {
  terraform -chdir="$ENVIRONMENT_DIRECTORY" output -raw "$1"
}
