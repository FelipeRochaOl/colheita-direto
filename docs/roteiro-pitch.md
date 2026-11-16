# Roteiro: vídeo-pitch técnico (até 5 minutos)

> GS2 CitizenTech · entrega 19/11 · publicar no YouTube como **não listado** e enviar o link em `.txt`.
> A ordem segue a rubrica: problema (3 pts), público e mercado (3), impacto e valor (3), diferencial (3), resultados e impacto (8).
> **Narração total: cerca de 650 palavras**, ritmo calmo (~130 palavras/min) = 5 min. Fontes dos números em `concepcao.md` §8.

## Antes de gravar

- [ ] Ambiente no ar: `pnpm infra:start` (AWS) ou local (`README.md`). Para o vídeo, o ideal é a classificação **real** com Claude Vision (`CLASSIFIER_BACKEND=claude`). Se ainda não houver acesso ao Bedrock, grave com o classificador simulado e **não diga** que a classe da tela veio da IA. Diga "a classificação aparece aqui".
- [ ] Fotos reais: uma caixa de tomate bonita (vira A/B) e uma com tomates machucados (vira C/D). Boa luz, de cima.
- [ ] Dados de demonstração: cotações de exemplo carregadas (`seed-development-data`), uma ONG e um transportador aprovados.
- [ ] Duas abas: produtor (`/produtor`) e comprador (`/mercado`). Celular com o app aberto para 2 tomadas curtas.
- [ ] Gravar a tela em 1080p; cortar esperas de carregamento na edição.

---

## Cena 1 · Problema (0:00–0:45) · 3 pts

**Tela:** foto de caixas de tomate descartadas (banco de imagens livre) → corte para os números em texto grande sobre o fundo escuro do design system.

**Narração:**
> O Brasil tem 3,9 milhões de propriedades de agricultura familiar. São 77% dos estabelecimentos rurais, mas ficam com só 23% do valor da produção.
> Um dos motivos aparece na hora da colheita. O pequeno produtor vende tudo para um atravessador, que define o preço na porteira. E as caixas fora do padrão, com fruta pequena ou manchada, não têm comprador: apodrecem.
> Estimativas da Embrapa falam em 30 a 40% de perda pós-colheita em frutas e hortaliças.
> Ou seja: o produtor ganha pouco e o alimento se perde. Enquanto isso, perto dele há restaurantes, escolas, indústrias e bancos de alimentos que precisam justamente desse produto.

**Texto na tela:** `3,9 mi propriedades familiares · 23% do valor` · `30–40% de perda pós-colheita (Embrapa)`

---

## Cena 2 · Público-alvo e mercado (0:45–1:25) · 3 pts

**Tela:** diagrama simples com o produtor no centro e os atores em volta (pode ser um slide com os ícones).

**Narração:**
> A Colheita Direta é feita para o pequeno produtor de frutas, legumes e verduras. Ela conecta esse produtor a quem compra: varejo de bairro, restaurantes, indústria, consumidor final e prefeituras.
> E tem um mercado garantido por lei: a partir de 2026, 45% da verba federal da merenda escolar, o PNAE, tem que ser gasta com a agricultura familiar.
> Em volta disso entram os prestadores de serviço, como transportadores, câmaras frias e embaladoras, além das ONGs que recebem doações. A porta de entrada são as cooperativas.
> O canal é o que o produtor já usa: o celular. 45% dos usuários de internet na zona rural acessam só pelo celular, e o WhatsApp é o principal canal do agro.

**Texto na tela:** `PNAE: 45% da agricultura familiar (Lei 15.226/2025)` · `45% dos usuários rurais: só celular (CETIC.br)`

---

## Cena 3 · Como funciona e valor (1:25–2:35) · 3 pts · DEMO

**Tela (demo ao vivo, sem cortes longos):**
1. App ou site do produtor → **Nova colheita** → tirar a foto da caixa de tomate → 30 caixas, 20 kg → **Classificar**.
2. O lote aparece com o selo **A**, os defeitos encontrados e o **preço sugerido**.
3. Clicar em **Vender (preço cheio)** → **Confirmar destino**.
4. Aba do comprador → a oferta aparece com a distância → carrinho → **frete com transportador da região** → Pix.
5. Mostrar o status mudando para **Pago** e (rápido) a notificação "Novo pedido pago" chegando ao produtor.

**Narração:**
> Funciona assim. O produtor fotografa a colheita, pelo app ou direto no WhatsApp.
> A visão computacional classifica o lote em A, B, C ou D e aponta os defeitos.
> Com a classe e as cotações de mercado, a plataforma sugere o preço e o destino.
> Este lote saiu classe A, com preço sugerido de 84 reais a caixa. Um clique e ele está à venda.
> Do outro lado, o restaurante encontra o tomate a 45 quilômetros, escolhe o frete com um transportador da região e paga com Pix.
> O pagamento já é dividido na hora: o produtor recebe direto, o transportador recebe o frete e a plataforma fica com uma taxa menor que a margem do atravessador.
> E o que é lote D não vira lixo. Ele vai para um banco de alimentos próximo, que é avisado na hora.

---

## Cena 4 · Diferencial e tecnologias (2:35–3:20) · 3 pts

**Tela:** slide com a tabela abaixo → 5 s do diagrama de arquitetura (`arquitetura.md` §2) → 5 s de uma conversa no WhatsApp com áudio.

| Tecnologia | O que faz na solução |
|---|---|
| **Visão computacional** | Classifica a qualidade (A–D), aponta defeitos e diagnostica pragas por foto |
| **Análise de dados** | Preço sugerido por cotações, indicadores de perda e renda, previsão de demanda |
| **Cloud (AWS)** | API, filas, fotos, inferência e escala, tudo em Terraform |
| **IA (Claude no Amazon Bedrock)** | Agente no WhatsApp que entende áudio, cria o lote, confirma o destino e anota despesas |

**Narração:**
> Nosso diferencial é que um único gesto, a foto, decide qualidade, preço e destino. Vender e combater o desperdício viram o mesmo fluxo.
> As quatro tecnologias trabalham de verdade.
> A visão computacional classifica e encontra pragas.
> A análise de dados transforma cotações em preço sugerido e mede o impacto.
> A nuvem da AWS roda tudo com filas e escala.
> E a inteligência artificial, com o Claude, conversa com o produtor no WhatsApp, inclusive por áudio. Ele não precisa preencher formulário.
> Comparando com as alternativas: o atravessador impõe o preço. Marketplaces que montaram logística própria, como a Frubana, fecharam no Brasil. Nós usamos o frete que já existe na região, sem armazém.

---

## Cena 5 · Resultados e impacto esperados (3:20–4:50) · 8 pts (a mais importante)

**Tela:** página **/impacto** (cartões verdes de indicadores) → slide com a tabela de metas → slide do piloto e do modelo de negócio → ícones dos ODS.

**Narração:**
> O impacto é medido desde o primeiro dia. Este painel mostra em tempo real a renda paga aos produtores, os quilos vendidos e doados e a taxa de aproveitamento da colheita.
> Para o piloto de 90 dias com uma cooperativa, 50 produtores e 20 compradores, as metas são:
> mais 20% de renda por caixa em relação ao atravessador;
> perda abaixo de 20% da colheita;
> 5 toneladas de alimento doado;
> venda em menos de 48 horas;
> e pelo menos 80% de concordância entre a classificação da IA e o classificador humano da cooperativa.
> A validação começa com uma linha de base: entrevistamos produtores para registrar o preço do atravessador e a perda atual, e comparamos antes e depois.
> O negócio se sustenta com comissão nas vendas, taxa sobre frete e serviços, plano premium de gestão para cooperativas e relatórios de impacto para empresas que querem o Selo Doador de Alimentos, da nova Política Nacional de Combate ao Desperdício.
> Em 24 meses, a meta é 5 mil produtores ativos em três cooperativas e dois estados. Depois vêm novas cadeias, como leite e ovos, e crédito rural usando o histórico de vendas.
> A Colheita Direta contribui com os ODS 2, Fome Zero; 12, Consumo e Produção Responsáveis, com a meta de reduzir pela metade as perdas de alimentos; 10, Redução das Desigualdades; e 13, Ação Contra a Mudança do Clima.

**Tabela no slide (metas):**

| Indicador | Piloto (90 dias) | 24 meses |
|---|---|---|
| Renda por caixa vs. atravessador | +20% | +30% |
| Perda da colheita | < 20% | < 10% |
| Alimento doado | 5 t | 300 t |
| Tempo até a venda | < 48 h | < 24 h |
| Acerto da classificação (IA × humano) | ≥ 80% | ≥ 92% |
| Produtores ativos | 50 | 5.000 |

---

## Cena 6 · Fechamento (4:50–5:00)

**Tela:** logo "Colheita **Direta**" sobre o fundo escuro + "ODS 2 · 10 · 12 · 13".

**Narração:**
> Colheita Direta: direto do produtor, sem atravessador e sem desperdício. A tecnologia é o meio. O produtor é o centro.

---

## Checklist de entrega

- [ ] Vídeo com **até 5:00** (confira no editor).
- [ ] As 4 tecnologias aparecem **funcionando**, não só citadas (cenas 3 e 4).
- [ ] ODS citados com a contribuição (cena 5).
- [ ] Números conferidos com as fontes de `concepcao.md` §8. Não usar o dado de 15–25% do atravessador: não achamos o estudo original.
- [ ] YouTube **não listado** → link no `.txt` → upload no FIAP ON até **19/11**.
- [ ] (Opcional) Vídeo Startup-One de 3 min para o prêmio: dá para reaproveitar as cenas 1, 3 e o fechamento, contados como a história do Seu João.
