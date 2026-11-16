#!/usr/bin/env bash
# Sobe (ou atualiza) toda a infraestrutura AWS + MongoDB Atlas e publica API, worker, visão e site.
# Uso: pnpm infra:start [dev|prod] [--yes]
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"
parse_arguments "$@"
check_prerequisites
require_command docker "Instale e abra o Docker Desktop."
require_command pnpm "Instale o pnpm."
docker info >/dev/null 2>&1 || fail "O Docker não está rodando. Abra o Docker Desktop."

confirm "Isto cria recursos PAGOS na conta $AWS_ACCOUNT_ID ($ENVIRONMENT)." "$ENVIRONMENT"

print_step "Bucket do estado do Terraform"
if aws s3api head-bucket --bucket "$TERRAFORM_STATE_BUCKET" 2>/dev/null; then
  echo "Já existe."
else
  aws s3api create-bucket --bucket "$TERRAFORM_STATE_BUCKET" \
    --create-bucket-configuration "LocationConstraint=$AWS_REGION" >/dev/null
  aws s3api put-bucket-versioning --bucket "$TERRAFORM_STATE_BUCKET" --versioning-configuration Status=Enabled
  aws s3api put-public-access-block --bucket "$TERRAFORM_STATE_BUCKET" --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  echo "Criado."
fi

terraform_init
IMAGE_TAG="$(date +%Y%m%d%H%M%S)"

print_step "Repositórios de imagens (ECR)"
terraform -chdir="$ENVIRONMENT_DIRECTORY" apply -input=false -auto-approve \
  -target=module.platform.module.container_registry >/dev/null
API_REPOSITORY="$(terraform -chdir="$ENVIRONMENT_DIRECTORY" output -json ecr_repository_urls | jq -r .api)"
VISION_REPOSITORY="$(terraform -chdir="$ENVIRONMENT_DIRECTORY" output -json ecr_repository_urls | jq -r .vision)"

print_step "Build e envio das imagens ($IMAGE_TAG)"
aws ecr get-login-password | docker login --username AWS --password-stdin "${API_REPOSITORY%%/*}" >/dev/null
docker build --platform linux/amd64 -f "$REPOSITORY_ROOT/apps/api/Dockerfile" -t "$API_REPOSITORY:$IMAGE_TAG" "$REPOSITORY_ROOT"
docker build --platform linux/amd64 -t "$VISION_REPOSITORY:$IMAGE_TAG" "$REPOSITORY_ROOT/services/vision"
docker push "$API_REPOSITORY:$IMAGE_TAG"
docker push "$VISION_REPOSITORY:$IMAGE_TAG"

print_step "Infraestrutura completa (VPC, ECS, ALB, CloudFront, SQS, S3, Atlas, segredos, alarmes)"
APPLY_FLAGS=(-input=false -var "api_image_tag=$IMAGE_TAG" -var "vision_image_tag=$IMAGE_TAG")
[[ "$SKIP_CONFIRMATION" == "true" ]] && APPLY_FLAGS+=(-auto-approve)
terraform -chdir="$ENVIRONMENT_DIRECTORY" apply "${APPLY_FLAGS[@]}"

CLUSTER_NAME="$(terraform_output ecs_cluster_name)"
print_step "Colocando as imagens novas no ar (ECS)"
for service in api-http api-worker vision; do
  aws ecs update-service --cluster "$CLUSTER_NAME" --service "$service" \
    --task-definition "$CLUSTER_NAME-$service" --force-new-deployment >/dev/null
done
echo "Aguardando os serviços estabilizarem (alguns minutos)..."
aws ecs wait services-stable --cluster "$CLUSTER_NAME" --services api-http api-worker vision \
  || print_warning "Serviços ainda não estáveis. Veja os logs no CloudWatch: /ecs/$CLUSTER_NAME/*"

API_URL="$(terraform_output api_url)"
print_step "Site (Vite → S3 + CloudFront)"
(cd "$REPOSITORY_ROOT" && pnpm install --frozen-lockfile >/dev/null && VITE_API_URL="$API_URL" pnpm turbo build --filter=@colheita/web... >/dev/null)
aws s3 sync "$REPOSITORY_ROOT/apps/web/dist" "s3://$(terraform_output web_bucket_name)" --delete >/dev/null
aws cloudfront create-invalidation --distribution-id "$(terraform_output web_distribution_id)" --paths "/*" >/dev/null

print_step "Pronto"
echo "Site:  $(terraform_output web_app_url)"
echo "API:   $API_URL  (Swagger em $API_URL/docs)"
echo "Webhook WhatsApp: $API_URL/webhooks/whatsapp"
echo
echo "Próximos passos: preencha no Secrets Manager (colheita-$ENVIRONMENT/...) as chaves do Asaas e da Meta"
echo "e rode 'pnpm infra:start $ENVIRONMENT' de novo para os serviços lerem os valores."
print_warning "A infraestrutura gera custo enquanto estiver no ar. Para derrubar: pnpm infra:stop $ENVIRONMENT"
