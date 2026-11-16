# 09 · Excedente: leilão, doação, ração animal, insumo industrial

> Requisitos legais marcados **(verificar)** precisam de validação com jurídico, MAPA e vigilância sanitária antes do lançamento.

## MVP
- [x] Regras de destino por classe (C → leilão/indústria; D → doação/ração/compostagem) configuráveis — **Pronto quando:** admin altera regra sem deploy
- [x] Cadastro de ONGs/bancos de alimentos (CNPJ, capacidade, área, horários) com aprovação — **Pronto quando:** ONG aprovada recebe alertas
- [x] Oferta de doação para ONGs próximas com aceite e agendamento de retirada — **Pronto quando:** doação aceita e retirada registrada
- [x] Comprovante de recebimento (foto + confirmação da ONG) e kg doados no KPI — **Pronto quando:** KPI 3 alimentado automaticamente
- [ ] Conformidade com a **Lei 15.224/2025** (PNCPDA) para doações — **(verificar)** — **Pronto quando:** parecer jurídico arquivado

## v1
- [ ] **Leilão de excedente** (lances com prazo, preço mínimo do produtor, arremate com pagamento Asaas) — **Pronto quando:** leilão completo com split
- [ ] Compradores industriais (polpa, molho, desidratados) com demanda cadastrada e match automático — **Pronto quando:** lote C oferecido automaticamente a indústrias compatíveis
- [ ] **Ração animal:** somente resíduo **de origem vegetal**, sem contato com proteína animal; seguir orientações do MAPA contra peste suína — **(verificar norma federal e estadual)** — **Pronto quando:** termo de responsabilidade e regra no sistema
- [ ] Compostagem/biogás como destino final — **Pronto quando:** parceiros cadastrados
- [ ] Selo Doador / relatório de impacto para empresas — **Pronto quando:** PDF de impacto por empresa

## Escala
- [ ] Integração com redes de bancos de alimentos (municipais/estaduais) — **Pronto quando:** doação aparece no sistema parceiro
- [ ] Dados abertos de perdas para políticas públicas (anonimizados) — **Pronto quando:** dataset publicado
