# 04 · Site e painéis (Vite + React)

Padrão: funcional, React Query, Tailwind + Ant Design tematizado com LeafyGreen, `features/` por domínio.

## MVP
- [x] Projeto Vite em `apps/web` com `app/`, `pages/`, `features/` — **Pronto quando:** deploy no S3 + CloudFront via CI
- [x] Providers: QueryClient, `ConfigProvider` AntD com `antDesignTheme`, roteamento — **Pronto quando:** nenhuma cor fora dos tokens
- [x] Vitrine pública: home, busca, página de produto/produtor — **Pronto quando:** comprador encontra oferta sem login
- [x] Checkout com Pix (QR code + copia e cola) e status em tempo real (polling React Query) — **Pronto quando:** tela muda para "pago" sozinha
- [x] Painel do comprador: pedidos, recebimento, avaliação — **Pronto quando:** comprador acompanha o pedido até a entrega
- [ ] Painel da cooperativa (piloto): produtores, lotes, vendas, KPIs — **Pronto quando:** KPIs 1–6 da concepção visíveis

## v1
- [ ] Painel do prestador de serviço (frete, câmara fria, embalagem): pedidos de serviço, agenda, repasses — **Pronto quando:** prestador aceita e conclui serviço pelo painel
- [ ] Painel do produtor (web) espelhando o app — **Pronto quando:** paridade com o mobile nas telas de gestão
- [ ] Painel da ONG: doações disponíveis, aceite, comprovante (regras em 09) — **Pronto quando:** ONG aceita doação e anexa comprovante pelo painel _(implementado, falta verificar)_
- [ ] Painel de leilão com lances em tempo real (regras em 09) — **Pronto quando:** dois compradores disputam lote e o vencedor paga via Asaas
- [ ] Painel admin: usuários, disputas, moderação, templates — **Pronto quando:** operação não precisa acessar banco direto
- [ ] SEO (SSG/pre-render das páginas de produto), Open Graph — **Pronto quando:** página de oferta indexável e com preview no WhatsApp
- [ ] Acessibilidade WCAG 2.1 AA — **Pronto quando:** axe sem erros críticos
- [ ] Testes (Vitest + Testing Library; Playwright nos fluxos de compra) — **Pronto quando:** rodam no CI

## Escala
- [ ] Portal de compras públicas (prefeituras) — **Pronto quando:** prefeitura publica demanda e recebe propostas
- [ ] Internacionalização preparada (pt-BR padrão) — **Pronto quando:** textos externalizados
