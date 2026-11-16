# 11 · Dados e analytics

## MVP
- [ ] Eventos de negócio padronizados (lote criado, classificado, publicado, vendido, doado, entregue) — **Pronto quando:** todos os KPIs derivam desses eventos
- [ ] Coleta diária de cotações de referência (CONAB Prohort / CEASAs com dados públicos) via EventBridge Scheduler — **Pronto quando:** série histórica por produto e praça
- [x] **Preço sugerido v0:** referência do dia ajustada por classe e frete — **Pronto quando:** sugestão exibida em todo lote A/B
- [x] Painel de KPIs do piloto (KPIs 1–6) — **Pronto quando:** cooperativa acompanha semanalmente

## v1
- [ ] Data lake em S3 (exportação de eventos) + Athena/Glue — **Pronto quando:** consultas analíticas fora do banco transacional
- [ ] Dashboards (Amazon QuickSight ou embutidos no painel) — **Pronto quando:** painéis por cooperativa, região e cultura
- [ ] **Previsão de demanda** por produto/região (séries temporais) — **Pronto quando:** erro (MAPE) medido e publicado
- [ ] **Preço sugerido v1** com histórico da plataforma e elasticidade — **Pronto quando:** teste A/B vs. v0
- [ ] **Mapa de surtos de pragas** (diagnósticos geolocalizados, agregados) — **Pronto quando:** alerta a vizinhos num raio configurável
- [ ] Indicadores de impacto (kg salvos, CO₂e evitado, renda) — **Pronto quando:** relatório trimestral automático
- [ ] Anonimização/agregação mínima para dados compartilhados — **Pronto quando:** nenhuma métrica pública identifica produtor

## Escala
- [ ] API de dados para prefeituras/cooperativas — **Pronto quando:** consumo autenticado com limites
- [ ] Modelos de recomendação de compradores para cada lote — **Pronto quando:** taxa de venda em < 24 h aumenta
