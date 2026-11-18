---
title: 'Prestador divulga serviços e preços; produtor contrata'
type: 'feature'
created: '2026-11-18'
status: 'done'
route: 'dispatch'
baseline_commit: '32c941eedd64e9a6efdc83ce041828d2532f2f6f'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** O prestador/transportadora só informa tipos de serviço e raio no cadastro: não tem área logada, não define preço (o frete usa tabela fixa R$ 25 + R$ 1,80/km) e não edita os dados. O produtor não tem como encontrar nem contratar um serviço.

**Approach:** Área "Meus serviços" para o prestador publicar cada serviço com preço (transporte: taxa de saída + R$/km; demais: preço por unidade), raio e base. O produtor busca prestadores aprovados que atendem sua fazenda, vê o preço estimado e envia uma solicitação que o prestador aceita ou recusa.

## Boundaries & Constraints

**Always:** regras em use-cases/serviços; contratos novos em `@colheita/contracts`; chamadas pelo `ColheitaApiClient`; campos novos opcionais no Mongo (prestadores antigos continuam válidos); telas em claro/escuro e celular; comentários em português.

**Never:** quebrar `POST /service-providers` ou o fluxo de pedido do comprador; prestador não aprovado aparecer na busca; migração destrutiva.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Publicar preços | prestador envia TRANSPORT base 30, 2,5/km, raio 80 | perfil salvo, busca passa a usar esses valores | N/A |
| Serviço sem preço | serviceTypes inclui PACKING sem preço | 400 de validação | mensagem no formulário |
| Busca do produtor | TRANSPORT, fazenda a 40 km da base, raio 80 | prestador listado com estimativa base + km×preço | N/A |
| Fora do raio / não aprovado | distância > raio ou isApproved=false | não aparece | lista vazia com aviso |
| Solicitar | produtor escolhe prestador e quantidade | solicitação REQUESTED visível aos dois | 422 se prestador não atende ou não oferece |
| Responder | prestador aceita/recusa REQUESTED | status ACCEPTED/DECLINED | 422 se já respondida; 404 se não é dele |

**Decisões (humano, 2026-11-18):**
1. Contratação por solicitação direta: produtor escolhe o prestador, prestador aceita/recusa; pagamento combinado fora do app.
2. Unidade fixa por tipo: transporte = taxa de saída + R$/km; câmara fria R$/caixa/dia; embalagem R$/caixa; classificação e assistência técnica R$/visita.
3. Frete dos pedidos do comprador usa o preço do prestador escolhido; tabela atual só como reserva.

</frozen-after-approval>

## Code Map

- `packages/contracts/src/{enums,schemas}.ts` -- `SERVICE_TYPES`, `registerServiceProviderSchema` (manter); adicionar schemas de preço, perfil, busca e solicitação.
- `apps/api/src/modules/service-providers/` -- entidade/schema/repositório Mongo (`findApprovedServingLocation` já filtra raio e aprovação), `ServiceFeeCalculator` (tabela fixa), controller. Seguir padrão `producers` (`GET/PUT /me`, use-case + spec com repositório em memória).
- `apps/api/src/modules/orders/services/intermediary-service-planner.ts` -- consumidor do calculador (Q3).
- `apps/api/src/shared/geo/geo-distance.ts` -- `calculateDistanceKm`.
- `packages/api-client/src/{api-client,query-keys}.ts`, `hooks/use-profile-hooks.ts` -- padrão de hooks.
- `apps/web/src/features/signup/components/service-provider-signup-form.tsx` -- reaproveitar como formulário de edição (prop `profile`, igual aos outros).
- `apps/web/src/app/router.tsx`, `utils/role-home.ts` -- rota `/prestador` e link de área; `pages/producer-page.tsx` -- nova aba "Serviços".
- Não há e2e (Playwright); testes são Jest em `apps/api`.

## Tasks & Acceptance

**Execution:**
- [x] `packages/contracts` -- `serviceOfferingSchema` (serviceType, price, baseFee opcional p/ transporte), perfil/update do prestador, busca e `serviceRequest` -- contrato único web/API.
- [x] `apps/api/.../service-providers` -- entidade com `offerings`, `updateProfile`, `estimatePrice(serviceType, distanceKm, quantity)`; use-cases Get/Update perfil, Search, Create/Respond/List solicitações; schema Mongo `service_requests`; rotas `GET/PUT /service-providers/me`, `GET /service-providers/available`, `POST/GET /service-requests`, `POST /service-requests/:id/{acceptance,refusal}`.
- [x] specs Jest dos use-cases cobrindo a matriz.
- [x] `packages/api-client` -- métodos e hooks.
- [x] `apps/web` -- página `/prestador` (meus serviços + solicitações recebidas), aba "Serviços" no produtor (buscar, estimar, solicitar, acompanhar), aba no "Meus dados".

**Acceptance Criteria:**
- Given prestador logado, when abre "Meus serviços", then edita serviços, preços, raio e base e vê solicitações recebidas.
- Given produtor com fazenda cadastrada, when escolhe um serviço, then vê prestadores que atendem a fazenda com preço estimado e consegue solicitar.

## Implementation Notes

- Implementado direto (sem subagente, preferência do usuário). Contratos: `serviceOfferingSchema`, `updateServiceProviderProfileSchema`, `searchServiceProvidersSchema`, `createServiceRequestSchema`, `serviceRequestSchema`, `SERVICE_PRICE_UNITS`, `SERVICE_REQUEST_STATUSES`. `POST /service-providers` inalterado.
- `ServiceProvider.offerings` (Mongo: subdocumento com default `[]`, sem migração); `updateProfile` sincroniza `serviceTypes` com as ofertas; `estimatePrice = baseFee + price × quantidade`.
- Busca exclui prestador sem preço divulgado e o próprio produtor; ordena por preço.
- Solicitação guarda o preço estimado no momento; celular da outra parte só após ACCEPTED; responder solicitação de outro prestador → 404.
- Planner de pedidos usa `estimatePrice` do prestador mais próximo e cai na tabela fixa se não houver preço.
- Web: `/prestador` (solicitações + serviços/preços/cobertura), aba "Frete e serviços" no produtor, aba no "Meus dados"; data com input nativo para não adicionar `dayjs`.
- Seed de demo publica preços do "Fretes Alto Tietê".
- Não há e2e (Playwright) no projeto; cobertura via Jest de use-cases (matriz completa) + planner.

## Spec Change Log

## Review Triage Log

## Verification

**Commands:**
- `pnpm --filter @colheita/api test` -- expected: todos passam
- `pnpm typecheck` -- expected: sem erros
- Revisão: feita inline pelo advisor (sem revisores paralelos, preferência do usuário). Corrigido: produtor contratando o próprio serviço; quantidade padrão ao trocar de serviço.
- Verificação real: API sobe (DI ok), rotas novas mapeadas, 401 sem login. Fluxo autenticado de ponta a ponta não rodado (seed apaga o banco local).
