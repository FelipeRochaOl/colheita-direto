# 02 · Marketplace e pagamentos (Asaas)

## MVP
### Catálogo e pedido
- [x] Oferta criada a partir de lote A/B (produto, classe, quantidade, preço, fotos, local) — **Pronto quando:** aparece no site e no catálogo WhatsApp
- [x] Busca por produto, distância (`$geoNear`), classe e preço — **Pronto quando:** comprador filtra "tomate A até 50 km"
- [x] Carrinho multi-produtor e pedido dividido por produtor — **Pronto quando:** um checkout gera N sub-pedidos
- [x] Máquina de estados do pedido (`CREATED → PAID → READY → IN_TRANSIT → DELIVERED → SETTLED`, `CANCELLED`, `DISPUTED`) — **Pronto quando:** transição inválida lança erro de domínio
- [ ] Confirmação do produtor (aceitar/recusar em X horas) — **Pronto quando:** recusa estorna automaticamente
- [ ] Pedido `CREATED` não pago expira no vencimento do Pix: cancela e devolve as caixas reservadas (`releaseBoxes`) — **Pronto quando:** caixas voltam à oferta após o vencimento

### Asaas
- [x] Interface `PaymentGateway` + `AsaasPaymentGateway` — **Pronto quando:** use-cases não importam nada do Asaas
- [ ] Subconta Asaas por produtor e transportador (onboarding com KYC) — **Pronto quando:** produtor aprovado recebe `walletId`
- [ ] Cobrança Pix (e cartão/boleto para PJ) com **split** produtor + prestadores (frete, armazenagem, embalagem) + plataforma — **Pronto quando:** valores conferem centavo a centavo no sandbox _(implementado, falta verificar)_
- [ ] Webhook Asaas com token validado e idempotência — **Pronto quando:** evento duplicado ignorado _(implementado, falta verificar)_
- [ ] **(verificar)** Asaas permite reter o split até a entrega? Se sim: repasse só após `DELIVERED`. Se não: cobrança após aceite do produtor + política de reembolso (sem custódia na plataforma) — **Pronto quando:** modelo validado com o Asaas e jurídico
- [ ] Estorno total/parcial — **Pronto quando:** cancelamento devolve ao comprador e ajusta split

## v1
- [ ] Avaliações (produtor, comprador, transportador) com foto na entrega — **Pronto quando:** nota média visível na oferta
- [ ] Disputa: comprador contesta qualidade com foto; mediação comparando foto original × entrega — **Pronto quando:** fluxo resolvido pelo admin em painel
- [ ] **Consumidor final:** cestas e delivery (app/site), agendamento de entrega no bairro — **Pronto quando:** pessoa física compra cesta e recebe em casa
- [ ] Pedidos recorrentes (assinatura semanal para restaurantes) — **Pronto quando:** pedido gerado automaticamente
- [ ] Nota fiscal: emissão de NF-e/nota do produtor rural conforme UF (integração ou orientação) — **Pronto quando:** pedido PJ sai com documento fiscal
- [ ] Compras públicas: perfil "prefeitura/escola", produtores com CAF válido, exportação para chamada pública PNAE — **Pronto quando:** prefeitura monta proposta com produtores aptos

## Escala
- [ ] Antecipação de recebíveis para produtor (Asaas) — **Pronto quando:** produtor solicita no app
- [ ] Preço dinâmico por demanda (ver 11) — **Pronto quando:** teste A/B mostra ganho de conversão
