#!/usr/bin/env bash
# Derruba toda a infraestrutura do ambiente (para de gerar custo).
# Uso: pnpm infra:stop [dev|prod] [--yes]
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
parse_arguments "$@"
check_prerequisites

if [[ "$ENVIRONMENT" == "prod" ]]; then
  print_warning "PRODUÇÃO: o cluster MongoDB Atlas e TODOS os dados (pedidos, produtores, fotos) serão apagados."
  SKIP_CONFIRMATION="false" # produção sempre pede confirmação, mesmo com --yes
fi
confirm "Isto APAGA todos os recursos de '$ENVIRONMENT' na conta $AWS_ACCOUNT_ID, inclusive o banco de dados." "apagar-$ENVIRONMENT"

terraform_init
print_step "Destruindo a infraestrutura (CloudFront pode levar alguns minutos)"
DESTROY_FLAGS=(-input=false -auto-approve)
terraform -chdir="$ENVIRONMENT_DIRECTORY" destroy "${DESTROY_FLAGS[@]}"

print_step "Pronto"
echo "Recursos de '$ENVIRONMENT' removidos. O bucket de estado (s3://$TERRAFORM_STATE_BUCKET) foi mantido:"
echo "ele custa centavos e guarda o histórico para subir de novo com 'pnpm infra:start $ENVIRONMENT'."
