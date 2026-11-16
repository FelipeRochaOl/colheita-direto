# 07 · WhatsApp (Meta Cloud API direto) e SMS

## MVP
### Setup da conta Meta via MCP (Claude Code, ponta a ponta)
- [ ] MCP do Facebook/Meta conectado ao Claude Code com acesso à conta do projeto (Business Manager) — **Pronto quando:** Claude lista os ativos da conta pelo MCP
- [ ] Claude cria pelo MCP: app na Meta for Developers, produto WhatsApp, WhatsApp Business Account e perfil comercial — **Pronto quando:** IDs (app, WABA, phone number) salvos no Secrets Manager
- [ ] Claude registra e verifica o número, gera token de sistema (System User) com permissões mínimas — **Pronto quando:** token permanente no Secrets Manager, sem token pessoal
- [ ] Claude configura o webhook (URL da API + verify token) e assina os campos `messages` — **Pronto quando:** mensagem de teste chega à API
- [ ] Claude cria e submete os templates do MVP e acompanha a aprovação — **Pronto quando:** todos `APPROVED`
- [ ] Claude cria o catálogo (produtos e serviços) e liga ao número — **Pronto quando:** catálogo visível no WhatsApp
- [ ] Tudo que o MCP criou registrado em `docs/meta-setup.md` (IDs, permissões, como recriar) — **Pronto quando:** outra pessoa reproduz o setup lendo o documento
- [ ] Etapas que exigem ação humana (verificação do negócio, pagamento, 2FA) listadas e concluídas — **Pronto quando:** conta sem pendências no Business Manager

### Integração
- [x] Webhook `POST /webhooks/whatsapp` com verificação (`hub.verify_token`) e validação de assinatura `X-Hub-Signature-256` — **Pronto quando:** requisição sem assinatura válida é rejeitada
- [ ] Recebimento de texto, áudio, imagem, localização e botões; download de mídia para S3 — **Pronto quando:** foto do WhatsApp vira lote _(parser testado; falta verificar com a Meta)_
- [x] Processamento assíncrono (webhook responde 200 rápido e publica evento) — **Pronto quando:** resposta ao webhook < 1 s
- [x] Integração em runtime **direto na Graph API** (sem BSP); o MCP é ferramenta de construção/setup, não dependência de produção — **Pronto quando:** envio e recebimento funcionam sem o MCP
- [ ] `WhatsAppChannel` (Graph API) com mensagens interativas (botões, listas) — **Pronto quando:** produtor publica lote com um toque _(implementado, falta verificar)_
- [ ] **Regra da janela de 24 h:** fora dela, só templates aprovados — **Pronto quando:** sistema escolhe template automaticamente fora da janela _(implementado, falta verificar)_
- [ ] Templates do MVP (criados via MCP): OTP, novo pedido, pagamento recebido, lote classificado, doação disponível — **Pronto quando:** todos aprovados pela Meta
- [ ] Opt-in/opt-out registrado ("SAIR" desativa) — **Pronto quando:** usuário sem opt-in não recebe proativas
- [ ] Limite de pedidos de código (OTP) por telefone e por IP — **Pronto quando:** o 4º pedido em 10 min para o mesmo número é bloqueado
- [ ] `SmsChannel` (Amazon SNS / End User Messaging) como fallback de OTP e alertas críticos — **Pronto quando:** sem WhatsApp, OTP chega por SMS _(implementado, falta verificar)_

## v1
- [ ] Catálogo no WhatsApp com **produtos** (ofertas A/B) e **serviços** (frete, armazenagem, embalagem) sincronizados — **Pronto quando:** comprador vê e pede pelo catálogo
- [ ] Carrinho do WhatsApp → pedido na plataforma → link Pix — **Pronto quando:** pedido completo sem sair do WhatsApp
- [ ] Monitoramento de qualidade do número e limites de envio (tier) — **Pronto quando:** alerta se qualidade cair
- [ ] Custo por conversa monitorado por categoria (utilidade, marketing, autenticação) — **Pronto quando:** dashboard de custo

## Escala
- [ ] Vários números por região/cooperativa — **Pronto quando:** roteamento por número configurado
- [ ] Fluxos WhatsApp (Flows) para cadastro guiado — **Pronto quando:** cadastro completo via Flow
