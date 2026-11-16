# 08 · Serviços intermediários e logística

Módulos `service-providers` (cadastro e catálogo de serviços) e `deliveries` (execução e rastreio).
Tipos de prestador: **transporte**, **armazenagem refrigerada (câmara fria)**, **beneficiamento/embalagem**, **classificação presencial**, **assistência técnica**. Novo tipo = nova configuração, não novo código.

## MVP
- [x] Modelo genérico `ServiceProvider` + `ServiceOffering` (tipo, área de atuação, capacidade, preço base) — **Pronto quando:** transporte e câmara fria cadastrados com o mesmo fluxo
- [x] Cadastro de transportador: documento, CNH, veículo (tipo, capacidade, refrigerado), área — **Pronto quando:** aprovado por admin
- [ ] Verificação de documentos de qualquer prestador (upload + revisão manual) — **Pronto quando:** sem aprovação não recebe pedidos
- [ ] Subconta Asaas do prestador para receber no split — **Pronto quando:** prestador aprovado tem `walletId`
- [x] Opções "retirada pelo comprador" e "entrega pelo produtor" — **Pronto quando:** pedido fecha sem prestador
- [x] Cotação de frete por distância × tipo de veículo — **Pronto quando:** frete exibido no checkout

## v1
- [ ] Pedido de serviço oferecido a prestadores próximos (`$geoNear`) com aceite — **Pronto quando:** frete aceito em < 2 h no piloto
- [x] Serviços combinados no pedido (frete + câmara fria + embalagem) com split para cada prestador — **Pronto quando:** um pedido paga 3 prestadores corretamente
- [ ] Serviços avulsos contratados pelo produtor (ex.: armazenar 20 caixas por 3 dias, embalar para PNAE) — **Pronto quando:** produtor contrata pelo WhatsApp
- [ ] Consolidação de cargas e frete de retorno — **Pronto quando:** KPI 8 medido
- [ ] Check-in de coleta e entrega com foto e geolocalização — **Pronto quando:** entrega confirmada dispara liberação/fechamento do pedido
- [ ] Rastreio do pedido para o comprador — **Pronto quando:** status e ETA visíveis
- [ ] Cadeia fria: exigir veículo refrigerado/câmara para produtos sensíveis — **Pronto quando:** regra por produto aplicada
- [ ] **(verificar)** Documentação de transporte e licenças sanitárias exigidas por UF — **Pronto quando:** checklist jurídico revisado

## Escala
- [ ] Roteirização otimizada (Amazon Location Service) — **Pronto quando:** km por entrega reduzido vs. baseline
- [ ] Pontos de coleta comunitários (cooperativa/escola) — **Pronto quando:** produtor entrega no ponto e transportador consolida
- [ ] Reputação e ranking de prestadores — **Pronto quando:** pedidos priorizam prestadores melhor avaliados
