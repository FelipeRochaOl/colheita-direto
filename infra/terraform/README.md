# Infraestrutura (AWS + Terraform)

Toda a infraestrutura roda na AWS. O MongoDB Atlas M0 é hospedado na AWS e também é criado aqui (provider `mongodbatlas`).

```
modules/
  network/            VPC, subnets públicas/privadas, NAT com Elastic IP fixo (liberado no Atlas)
  ecr/                repositórios de imagens (api, vision)
  ecs-service/        serviço ECS Fargate genérico (usado por api-http, api-worker e vision)
  load-balancer/      ALB + HTTPS (ACM) + WAF com rate limit
  s3-cdn/             bucket (site ou fotos) + CloudFront
  sqs-queue/          fila + DLQ (3 tentativas)
  atlas-cluster/      projeto, cluster M0, usuário e IP access list do Atlas
  secrets/            Secrets Manager (Asaas, Meta, JWT, conexão Atlas)
  observability/      logs, alarmes de DLQ e de erros 5xx, orçamento
  github-deploy-role/ OIDC para o GitHub Actions publicar sem chave fixa
environments/
  dev/  prod/         composição dos módulos por ambiente
```

## Uso

```bash
pnpm infra:start    # sobe ou atualiza o dev (Terraform + imagens + site)
pnpm infra:stop     # derruba o dev
```

Pré-requisitos, variáveis e segredos, um por um: [`docs/deploy-aws.md`](../../docs/deploy-aws.md).
Os scripts ficam em `infra/scripts/`, usam o perfil AWS `colheita-terraform` (usuário IAM dedicado, não o root) e guardam o estado em `s3://colheita-direta-tfstate-<conta>`, com lock nativo do S3.
