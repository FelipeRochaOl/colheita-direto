# Checklists de desenvolvimento — Colheita Direta

Cada item tem um **Pronto quando** (critério objetivo de aceite). Fases:
- **MVP** — o mínimo para o piloto com 1 cooperativa (meses 0–3).
- **v1** — produto completo para venda (meses 3–12).
- **Escala** — multi-cooperativa / multi-estado (meses 12–24).

Padrões obrigatórios: [`../arquitetura.md`](../arquitetura.md).

**Legenda:** `[x]` implementado **e** verificado (testes automatizados ou teste ponta a ponta local) ·
`[ ] … (implementado, falta verificar)` código pronto, mas o critério de pronto depende de ambiente real
(conta AWS, número WhatsApp, chave Asaas, Bedrock) · `[ ]` a fazer.

## Ordem de execução

| # | Checklist | Depende de |
|---|---|---|
| 00 | [Fundação (monorepo, CI/CD, AWS/Terraform, LGPD)](./00-fundacao.md) | — |
| 01 | [Backend NestJS](./01-backend-nestjs.md) | 00 |
| 02 | [Marketplace + pagamentos Asaas](./02-marketplace.md) | 01 |
| 03 | [App mobile (React Native)](./03-app-react-native.md) | 01, design system |
| 04 | [Site e painéis (Vite)](./04-site-vite.md) | 01, design system |
| 05 | [Visão computacional (FastAPI)](./05-visao-computacional.md) | 00 |
| 06 | [IA — agente Claude (Bedrock)](./06-ia-claude.md) | 01, 05 |
| 07 | [WhatsApp (Meta) e SMS](./07-whatsapp-sms.md) | 01 |
| 08 | [Serviços intermediários e logística](./08-servicos-intermediarios.md) | 02 |
| 09 | [Excedente: leilão, doação, ração, insumo](./09-excedente.md) | 02, 05 |
| 10 | [Gestão do produtor (ERP)](./10-gestao-produtor.md) | 01, 06 |
| 11 | [Dados e analytics](./11-dados-analytics.md) | 01 |
| 12 | [Go-to-market e operação](./12-go-to-market.md) | todos |

## Recorte do MVP (caminho crítico)
1. Monorepo + infra dev/prod em Terraform (00)
2. Identidade por OTP + cadastro de produtor/comprador (01)
3. Foto → classificação A–D com Claude Vision (05)
4. WhatsApp: receber foto/áudio, responder, publicar lote (06, 07)
5. Marketplace web com pedido e pagamento Asaas com split (02, 04)
6. Doação de lotes D para ONG cadastrada (09)
7. Painel de KPIs do piloto (11)

## Definição de pronto (vale para todo item)
- [ ] Código segue `arquitetura.md` (classes/SOLID no back, funcional + React Query no front, nomes claros)
- [ ] Testes unitários dos use-cases e lint/typecheck verdes no CI
- [ ] Documentado (README do pacote ou OpenAPI)
- [ ] Deploy em `dev` via pipeline, sem passo manual
- [ ] Métricas/logs relevantes no CloudWatch
