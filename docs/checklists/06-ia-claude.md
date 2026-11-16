# 06 · IA — agente Claude (Amazon Bedrock)

Módulo `assistant` no backend. O agente conversa com produtores, compradores e transportadores e age por **tools** que chamam use-cases (nunca o banco direto).

## MVP
- [x] Interface `LanguageModelClient` + `BedrockClaudeClient` — **Pronto quando:** use-cases não dependem do SDK da AWS
- [ ] Prompt de sistema por perfil (produtor/comprador/transportador), português simples, frases curtas — **Pronto quando:** revisado com 5 produtores reais _(implementado, falta verificar)_
- [ ] Transcrição de áudio do WhatsApp (Amazon Transcribe pt-BR) antes do agente — **Pronto quando:** áudio de 30 s vira texto com sentido preservado _(implementado, falta verificar)_
- [x] Tools MVP: `createHarvestLot`, `getLotClassification`, `getSuggestedPrice`, `publishOffer`, `listMyOrders`, `donateLot` — **Pronto quando:** cada tool tem schema, teste e chama um use-case
- [ ] Confirmação explícita antes de ações com efeito (publicar, doar, aceitar pedido) — **Pronto quando:** nenhuma ação executa sem "sim" do usuário
- [x] Memória de conversa por usuário (últimas N mensagens + resumo no MongoDB) — **Pronto quando:** agente lembra o lote em andamento
- [x] Idempotência por `messageId` (reentrega da Meta ou do SQS não reexecuta tools) e número sem o 9º dígito reconhecido — **Pronto quando:** teste com a mesma mensagem duas vezes executa o agente uma vez
- [ ] Guardrails: escopo limitado ao produto, sem conselhos de agrotóxicos fora de recomendação técnica, encaminhamento para humano — **Pronto quando:** conjunto de testes adversariais passa

## v1
- [ ] Tools v1: `registerExpense`, `getStockSummary`, `diagnosePest`, `quoteFreight`, `getWeatherAlert`, `findBuyers` — **Pronto quando:** cobertas por testes
- [ ] Resposta em áudio (Amazon Polly pt-BR) para quem prefere voz — **Pronto quando:** preferência salva no perfil
- [ ] Recomendações proativas (via templates — ver 07): melhor dia de venda, lote parado, praga na vizinhança — **Pronto quando:** taxa de ação ≥ 20%
- [ ] Conjunto de avaliação (evals) com conversas reais anonimizadas — **Pronto quando:** roda no CI a cada mudança de prompt
- [ ] Controle de custo: limite de tokens por usuário/dia, modelo menor para tarefas simples, cache — **Pronto quando:** custo por produtor ativo/mês dentro do orçamento

## Escala
- [ ] Negociação assistida comprador ↔ produtor (contraproposta dentro de limites definidos pelo produtor) — **Pronto quando:** produtor define preço mínimo e o agente respeita
- [ ] Atendimento em outros idiomas regionais/libras (vídeo) — **Pronto quando:** pesquisa com usuários aprova
