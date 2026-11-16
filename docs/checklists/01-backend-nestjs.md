# 01 · Backend NestJS (`apps/api`: entrypoints `main.ts` HTTP e `worker.ts` filas)

Padrão de módulo: `entities/ repositories/ schemas/ use-cases/ controllers/` + `services/` quando preciso (ver `arquitetura.md` §3.1).

## MVP
### Base
- [x] `apps/api` com dois entrypoints (`main.ts` HTTP, `worker.ts` consumidores SQS) usando os mesmos módulos; uma imagem Docker, dois serviços ECS — **Pronto quando:** worker executa `RouteHarvestLotUseCase` sem código duplicado
- [x] `shared/` com database (Mongoose + MongoDB Atlas, TLS, `maxPoolSize` ajustado ao M0), queue (SQS), storage (S3), logger, errors — **Pronto quando:** health check `/health` verifica DB e fila
- [x] Validação com os schemas zod de `@colheita/contracts` (`@ValidatedBody`) e Swagger gerado deles — **Pronto quando:** payload inválido retorna 400 padronizado
- [x] Filtro global de exceções de domínio → HTTP — **Pronto quando:** `HarvestLotNotFoundError` vira 404 sem `if` no controller
- [x] OpenAPI (Swagger) gerado — **Pronto quando:** `/docs` lista todas as rotas com exemplos
- [x] `EventPublisher` (interface) + `SqsEventPublisher`; consumidores no worker por evento — **Pronto quando:** evento com falha vai para a DLQ após 3 tentativas

### Módulos
- [x] `identity`: OTP por WhatsApp/SMS, JWT + refresh, papéis (RBAC) — **Pronto quando:** rota protegida por `@Roles('producer')` nega outros papéis
- [x] `producers`: cadastro, propriedade (geolocalização), culturas, CAF opcional — **Pronto quando:** produtor criado via app e via WhatsApp
- [x] `buyers`: cadastro PJ/PF, endereço de entrega, tipo (varejo, restaurante, indústria, prefeitura) — **Pronto quando:** comprador faz pedido
- [x] `harvest-lots`: criar lote com fotos, receber classificação, roteamento A–D (`RouteHarvestLotUseCase`) — **Pronto quando:** lote A/B vira oferta e lote D vira doação automaticamente
- [x] `notifications`: interface `NotificationChannel` + `WhatsAppChannel`, `SmsChannel`, `PushChannel` — **Pronto quando:** novo canal não altera use-cases existentes
- [ ] Índices MongoDB (`2dsphere` em localização, compostos em status+data) — **Pronto quando:** consultas principais < 100 ms com 100 mil lotes

### Qualidade
- [ ] Testes unitários dos use-cases com repositórios em memória — **Pronto quando:** cobertura ≥ 80% em `use-cases/`
- [ ] Testes e2e dos fluxos foto→oferta e pedido→pagamento — **Pronto quando:** rodam no CI contra Mongo em container
- [x] Rate limit por usuário/IP (`@nestjs/throttler`) — **Pronto quando:** excesso retorna 429

## v1
- [ ] `farm-management`, `surplus`, `service-providers`, `market-intelligence` e um módulo `deliveries` (rastreio de coleta/entrega) implementados (detalhes nos checklists 08–11) — **Pronto quando:** cada módulo com use-cases testados e rotas no OpenAPI
- [ ] Idempotência em webhooks e criação de pedido (chave de idempotência) — **Pronto quando:** webhook repetido não duplica efeito
- [ ] Auditoria (quem alterou o quê) em pedidos e pagamentos — **Pronto quando:** histórico visível no painel admin
- [ ] Versionamento de API (`/v1`) — **Pronto quando:** clientes antigos continuam funcionando após mudança

## Escala
- [ ] Serviços ECS de worker separados por fila de alto volume (notificações, visão), mesma imagem — **Pronto quando:** autoscaling por profundidade de fila
- [ ] Cache de leitura (ElastiCache) para catálogo e preços — **Pronto quando:** p95 do catálogo < 150 ms
