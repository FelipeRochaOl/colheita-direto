# Colheita Direta — Documento de Concepção

> **GS2 · CitizenTech: Tecnologia a Serviço do Cidadão** — Área 4 (Agricultura Inteligente e Desenvolvimento Rural), com interface nas áreas 3 (desperdício de alimentos) e 9 (novos modelos de negócio).
> Arquitetura técnica: [`arquitetura.md`](./arquitetura.md) · Execução: [`checklists/`](./checklists/README.md)

## 0. Identidade

**Nome provisório:** **Colheita Direta**
Alternativas avaliadas: *Safra Justa*, *Da Roça*, *RoçaLink*, *Rota da Colheita*.

**Em uma frase:** o produtor fotografa a colheita, a IA define a qualidade e encontra o melhor destino para cada caixa (venda direta, indústria, leilão ou doação), com frete e pagamento resolvidos, tudo pelo WhatsApp.

**Visão:** nenhum alimento bom fica sem comprador, e nenhum produtor familiar depende de atravessador para vender.

---

## 1. Proposta do projeto e problema evidenciado

### 1.1 O caso concreto (persona ilustrativa)
Seu João cultiva tomate e folhosas em 6 hectares. Na colheita, separa as caixas "bonitas" e vende tudo para um único atravessador, que define o preço na porteira. As caixas com defeito estético (fruta pequena, manchada, fora do padrão) ficam sem comprador e apodrecem ou viram adubo. Ele não sabe quanto o mesmo tomate valia no CEASA naquele dia, não sabe o custo real da safra e não tem contato com o restaurante a 30 km que compraria direto, nem com a prefeitura que precisa comprar da agricultura familiar para a merenda.

### 1.2 Evidências

| Evidência | Dado | Fonte |
|---|---|---|
| Peso da agricultura familiar | **3.897.408 estabelecimentos (77% do total)**, 10,1 milhões de pessoas ocupadas (67% da mão de obra), mas só **23% do valor da produção** | IBGE, Censo Agropecuário 2017 [1] |
| Perdas no hortifrúti | Estimativas recorrentes de **30% a 40%** de perdas pós-colheita de frutas e hortaliças (tomate ≈ 40%, alface ≈ 42%). *Dados antigos; a própria Embrapa aponta falta de medição atual, o que é parte do problema* | Embrapa [2]; Horticultura Brasileira/SciELO [3] |
| Desperdício no consumo | ~**94 kg por habitante/ano** desperdiçados nos domicílios brasileiros | PNUMA, Food Waste Index 2024 [4] |
| Atravessador | Produtor de hortifrúti retém ~**15%–25%** do preço final *(número citado como Cepea/Esalq; **confirmar no estudo original antes do pitch**)* | Compre Rural citando Cepea [5] |
| Demanda pública garantida | PNAE: mínimo de compra da agricultura familiar sobe de **30% para 45%** a partir de 01/01/2026 | Lei 15.226/2025 [6] |
| Marco legal novo | **Política Nacional de Combate à Perda e ao Desperdício de Alimentos** e Selo Doador de Alimentos; revoga a Lei 14.016/2020 | Lei 15.224/2025 [7] |
| Conectividade | **84,8%** da população rural com acesso à internet (2024); 77,2% com celular próprio | PNAD Contínua/IBGE [8] |
| Celular como única via | **45%** dos usuários rurais acessam a internet **só pelo celular** (30% no total) | CETIC.br, TIC Domicílios 2024 [9] |
| WhatsApp no campo | 84% dos produtores já usam ao menos uma tecnologia digital; WhatsApp é o principal canal do agro | Embrapa/Sebrae/Inpe 2020 [10]; ABMRA 2025 via Forbes [11] |

### 1.3 Por que é CitizenTech
O problema não é falta de comida nem de tecnologia: é **falta de conexão e de informação** entre quem produz e quem precisa. A solução usa o canal que o produtor já domina (WhatsApp, por voz e foto) para dar a ele **preço justo, mercado e destino para o que hoje é perdido**, gerando renda no campo e comida na mesa de quem tem insegurança alimentar.

---

## 2. Público-alvo e mercado

### 2.1 Quem é beneficiado

| Ator | Dor | O que ganha |
|---|---|---|
| **Pequeno produtor / agricultor familiar** (usuário central) | Vende barato ao atravessador, perde parte da colheita, não controla custos | Preço justo, venda direta, destino para o excedente, gestão simples por WhatsApp |
| **Comprador** (varejo de bairro, restaurantes, sacolões, indústria de polpa/molho) | Fornecimento irregular, sem rastreabilidade | Compra direta com qualidade classificada por foto e entrega agendada |
| **Consumidor final** (famílias da cidade) | Hortifrúti caro e sem origem conhecida | Cestas e delivery direto do produtor, estilo app de entrega, com origem rastreável |
| **Prefeituras / escolas (PNAE)** e PAA | Dificuldade de achar produtor apto e cumprir os 45% | Catálogo de produtores com CAF, histórico e logística |
| **Prestadores de serviços intermediários**: transportadores, câmaras frias, beneficiadoras/embaladoras, classificadores, técnicos agrícolas | Capacidade ociosa e clientes dispersos | Pedidos de serviço pela plataforma, com pagamento garantido no split. Exemplo: frete de retorno com o caminhão vazio |
| **ONGs e bancos de alimentos** | Doações imprevisíveis | Alertas de doação próxima, com rastreio |
| **Criadores e indústrias de insumo** (ração vegetal, compostagem, biogás) | Matéria-prima cara | Resíduo vegetal a baixo custo |
| **Cooperativas** | Gestão em planilha, baixa visibilidade dos cooperados | Painel da produção, vendas e indicadores dos cooperados |

### 2.2 Tamanho de mercado
- **TAM:** 3,9 milhões de estabelecimentos da agricultura familiar [1] mais compradores de alimentos frescos (varejo, food service, compras públicas).
- **SAM:** produtores familiares de frutas, legumes e verduras com celular e internet. *Calcular por UF com tabelas SIDRA do Censo Agro (produção hortícola) × acesso à internet rural [8].*
- **SOM (24 meses):** 3 cooperativas parceiras e seus cooperados no piloto e na expansão regional (ver seção 5).
- **Compras públicas:** 45% dos recursos federais do PNAE passam a ser destinados à agricultura familiar [6]. É um mercado garantido por lei que a plataforma ajuda o produtor a acessar.

### 2.3 Quem implementa
Cooperativas (canal de entrada e confiança), Emater/ATER (assistência técnica), prefeituras (PNAE), bancos de alimentos/ONGs, transportadores, Asaas (pagamentos) e AWS (infraestrutura).

---

## 3. Impacto e valor da solução

### 3.1 Como funciona (jornada do produtor)
1. **"Colhi 40 caixas de tomate"**: o produtor manda áudio e 3 fotos no WhatsApp.
2. **Visão computacional** classifica cada lote em **A / B / C / D**, aponta defeitos e estima volume.
3. **Análise de dados** sugere o preço com base em cotações de referência (CEASA/CONAB), demanda da região e histórico.
4. **O agente de IA (Claude)** responde em linguagem simples e por áudio:
   > "Seu João, 28 caixas ficaram A/B. Sugiro R$ X a caixa: tem 3 restaurantes e 1 escola interessados a até 40 km. As 12 caixas C podem ir para a fábrica de molho por R$ Y, ou para doação no banco de alimentos de [cidade]. Publico?"
5. O produtor toca **"Publicar"**. Compradores recebem no app, no site ou no catálogo do WhatsApp.
6. Pedido fechado → **serviços intermediários** cotados com prestadores da região (frete e, quando preciso, câmara fria, embalagem/beneficiamento) → pagamento via **Asaas com split** (produtor, cada prestador, plataforma).
7. Tudo alimenta automaticamente a **gestão do produtor**: colheita, estoque, receitas e despesas.

### 3.2 Destinos por qualidade

| Classe | Exemplo | Destino |
|---|---|---|
| **A** | padrão comercial | Marketplace (varejo, restaurantes, PNAE), preço cheio sugerido |
| **B** | pequeno defeito estético | Marketplace com desconto, sacolões, *"feio mas gostoso"* |
| **C** | fora de padrão, próprio para consumo | Leilão de excedente, indústria (polpa, molho, desidratados) |
| **D** | impróprio para venda | Doação (se próprio para consumo) → banco de alimentos/ONG; senão ração vegetal, compostagem, biogás |

### 3.3 Módulo de gestão do produtor (ERP de bolso)
- Registro de colheita por foto ou áudio, estoque por lote, receitas e despesas, fluxo de caixa simples.
- **Diagnóstico de pragas e doenças por foto**, com orientação de manejo e encaminhamento ao técnico da Emater ou da cooperativa.
- Alertas e recomendações por WhatsApp/SMS: melhor dia para vender, previsão de chuva na colheita, lote parado há X dias, praga detectada na vizinhança.

### 3.4 Benefícios
- **Renda:** fatia maior do preço final, sem atravessador.
- **Sustentabilidade:** menos alimento perdido, menos resíduo em aterro.
- **Inclusão:** voz e foto pelo WhatsApp, sem exigir alfabetização digital; SMS para quem não tem dados móveis.
- **Segurança alimentar:** excedente vira doação rastreada.
- **Acesso a política pública:** produtor apto ao PNAE conectado às prefeituras.
- **Acessibilidade:** interface com alto contraste e tipografia legível (design system LeafyGreen), áudio, ícones e fluxos curtos.

---

## 4. Diferencial

### 4.1 Como cada tecnologia obrigatória resolve o problema

| Tecnologia | O que faz na solução | Problema que resolve |
|---|---|---|
| **Visão Computacional** | Classificação de qualidade A–D por foto, detecção de defeitos, estimativa de volume; diagnóstico de pragas e doenças | Padroniza a qualidade sem classificador humano, gera confiança na compra à distância e decide o destino de cada lote |
| **Análise de Dados** | Preço sugerido (séries CEASA/CONAB + histórico), previsão de demanda por região, indicadores de perda, mapa de surtos de pragas, painéis de impacto | Tira o produtor do escuro sobre preço e demanda; mede o impacto |
| **Cloud (AWS)** | API, filas, armazenamento de imagens, inferência, agendamentos e escala, tudo em Terraform | Atende de 50 a 50 mil produtores com o mesmo código, com segurança e LGPD |
| **Inteligência Artificial (Claude via Bedrock)** | Agente no WhatsApp que entende áudio e texto, cria anúncios, negocia, cota frete, registra despesas e dá recomendações | Remove a barreira digital: o produtor conversa, não preenche formulário |

### 4.2 Comparação com alternativas

| Alternativa | Limitação | Colheita Direta |
|---|---|---|
| Atravessador | Preço imposto, sem transparência | Preço de referência transparente e venda direta |
| CEASA | Exige deslocamento e volume, sem destino para o excedente | Venda local e destino para todos os lotes |
| Marketplaces B2B de hortifrúti | Modelo pesado em logística própria; a Frubana, que captou US$ 271 mi, encerrou a operação no Brasil [12] | Modelo leve: frete de terceiros da própria região, sem armazém |
| Apps de doação | Só tratam o descarte | Doação é um dos destinos, integrada à venda |
| ERPs rurais | Feitos para médio/grande produtor, exigem formulários | Gestão pelo WhatsApp, por voz e foto |

**Diferencial central:** **um único gesto (a foto) decide qualidade, preço e destino**. Venda e combate ao desperdício são o mesmo fluxo.

---

## 5. Resultados e impacto esperados

### 5.1 Indicadores (KPIs)

| # | Indicador | Como medir | Linha de base | Meta piloto (90 dias) | Meta 24 meses |
|---|---|---|---|---|---|
| 1 | **Renda por caixa vendida** | Preço líquido recebido × preço pago pelo atravessador (entrevista no onboarding) | Preço do atravessador declarado | **+20%** | **+30%** |
| 2 | **Taxa de aproveitamento da colheita** | kg com destino (venda, indústria, doação) ÷ kg colhido registrado | Perda declarada pelo produtor (referência 30–40% [2]) | Perda **< 20%** | Perda **< 10%** |
| 3 | **Alimento doado** | kg entregues a ONGs/bancos de alimentos (comprovante de recebimento) | 0 | 5 t | 300 t |
| 4 | **Tempo até a venda** | Horas entre foto do lote e pedido confirmado | n/d (medir na semana 1) | < 48 h | < 24 h |
| 5 | **Precisão da classificação** | Concordância IA × classificador humano da cooperativa (amostra semanal) | — | ≥ 80% | ≥ 92% |
| 6 | **Produtores ativos** | ≥ 1 lote publicado no mês | 0 | 50 | 5.000 |
| 7 | **Vendas para compras públicas** | Valor de contratos PNAE/PAA via plataforma | 0 | 1 chamada pública atendida | 30 municípios |
| 8 | **Frete ocioso aproveitado** | % de entregas em rota de retorno/consolidada | 0 | 30% | 50% |
| 9 | **CO₂e evitado** | kg de alimento salvo × fator de emissão (FAO) + km evitados por consolidação | 0 | Relatório piloto | Relatório anual auditável |
| 10 | **Satisfação/inclusão** | NPS do produtor; % de usuários que operam só por WhatsApp/voz | — | NPS ≥ 50 | NPS ≥ 60 |

Todos os indicadores aparecem no painel da cooperativa e em um **relatório público de impacto** trimestral.

### 5.2 Plano de validação
1. **Descoberta (semanas 1–2):** entrevistas com 15 produtores e 5 compradores de uma cooperativa parceira; registro da linha de base (preço do atravessador, perda declarada).
2. **Dataset (semanas 1–4):** fotos rotuladas por classificador da cooperativa, combinadas com datasets públicos de doenças de plantas, para treinar e avaliar o modelo próprio.
3. **Piloto (90 dias):** 1 cooperativa, 50 produtores, 3 culturas (tomate, folhosas, banana), 20 compradores, 1 banco de alimentos, 5 transportadores.
4. **Avaliação:** comparação antes × depois nos KPIs 1–4; teste A/B do preço sugerido versus preço livre.
5. **Critério de sucesso:** ≥ 3 dos KPIs 1–5 atingindo a meta do piloto.

### 5.3 Implantação
| Fase | Prazo | Entrega |
|---|---|---|
| MVP | Meses 0–3 | WhatsApp + classificação (Claude Vision) + marketplace + Asaas + doação |
| Piloto | Meses 3–6 | 1 cooperativa; modelo de visão próprio v1; gestão do produtor |
| v1 | Meses 6–12 | App mobile completo, leilão, frete consolidado, PNAE, previsão de demanda |
| Escala | Meses 12–24 | 3+ cooperativas, novas culturas, novos estados, API para prefeituras |

### 5.4 Modelo de negócio e sustentabilidade financeira

| Receita | Quem paga | Modelo |
|---|---|---|
| Comissão por venda | Comprador/venda | % sobre pedidos A/B (abaixo da margem do atravessador) |
| Taxa de serviços | Pedido | % sobre frete e demais serviços intermediados (armazenagem, embalagem) |
| Taxa de leilão | Arrematante | % sobre lotes C arrematados |
| Gestão Premium | Produtor/cooperativa | Assinatura mensal com relatórios, previsão e multiusuário |
| Painel institucional | Cooperativas, prefeituras | Licença de painel e relatórios de impacto/PNAE |
| ESG / Selo Doador | Empresas compradoras | Relatório auditável de alimento salvo e doado (Lei 15.224/2025 [7]) |

*Percentuais e preços serão validados no piloto. Hipótese de partida: comissão de 8–10%, abaixo da margem típica de intermediação.*

**Custos-chave:** inferência de IA (Bedrock), mensagens WhatsApp (cobradas por template pela Meta), SMS, AWS, taxas Asaas, operação e suporte. Classificação com modelo próprio na v1 reduz o custo por foto em relação ao Claude Vision.

### 5.5 Expansão
- **Novas cadeias:** leite (qualidade por foto da embalagem/rótulo), ovos, mel, pescado artesanal.
- **Crédito e seguro:** histórico de vendas como score para microcrédito rural (parceiros Pronaf).
- **Governo:** integração com chamadas públicas do PNAE/PAA e dados abertos de perdas para a PNCPDA.
- **Mapa colaborativo de pragas** compartilhado com Emater e defesa agropecuária.

---

## 6. ODS e metas

| ODS | Meta | Contribuição |
|---|---|---|
| **2 – Fome Zero e Agricultura Sustentável** | 2.3 (dobrar renda e produtividade de pequenos produtores); 2.4 (sistemas sustentáveis) | Venda direta e preço justo; diagnóstico de pragas reduz perdas no campo |
| **12 – Consumo e Produção Responsáveis** | 12.3 (reduzir pela metade o desperdício e as perdas ao longo das cadeias) | Classificação e roteamento de todo lote; doação e reaproveitamento |
| **10 – Redução das Desigualdades** | 10.2 (inclusão econômica) | Interface por voz/WhatsApp; acesso a mercados e ao PNAE |
| **9 – Indústria, Inovação e Infraestrutura** | 9.3 (acesso de pequenas empresas a serviços e mercados); 9.c (acesso a TIC) | Tecnologia de ponta acessível pelo celular |
| **13 – Ação Contra a Mudança do Clima** | 13.1 (resiliência) | Menos metano de alimento em aterro; alertas climáticos na colheita |
| **11 – Cidades e Comunidades Sustentáveis** | 11.a (vínculos entre áreas urbanas e rurais) | Cinturão verde abastecendo a cidade diretamente |

---

## 7. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Baixa adoção pelo produtor | Entrada via cooperativa; WhatsApp e voz; agente de campo no piloto |
| Classificação errada gera disputa | Confiança mínima + confirmação humana; foto anexada ao pedido; política de contestação |
| Regras sanitárias para doação e ração | Doação segue a Lei 15.224/2025 [7] e as regras sanitárias; resíduo para animais **apenas de origem vegetal**, seguindo as orientações do MAPA sobre peste suína [13] (*verificar norma federal e estadual vigente com o MAPA*) |
| Exigências fiscais do produtor | Emissão de nota do produtor rural/NF-e conforme UF; validação de CAF para compras públicas |
| Custo de mensagens e IA | Templates mínimos, cache de respostas, modelo de visão próprio na v1, limites por usuário |
| Conectividade ruim | App offline com fila de envio; SMS como alternativa; fotos comprimidas |
| LGPD | Consentimento, minimização, criptografia, direito de exclusão (ver [`arquitetura.md`](./arquitetura.md#6-segurança-e-lgpd)) |

---

## 8. Referências
1. IBGE — Censo Agropecuário 2017: Agricultura Familiar. <https://biblioteca.ibge.gov.br/visualizacao/periodicos/3096/agro_2017_agricultura_familiar.pdf>
2. Embrapa — Perdas pós-colheita de frutas e hortaliças (1997). <https://www.infoteca.cnptia.embrapa.br/infoteca/bitstream/doc/415584/1/1997DOC0027.pdf>
3. Horticultura Brasileira (SciELO) — revisão sobre perdas pós-colheita. <https://www.scielo.br/j/hb/a/KRW5wC3LmKzPZZnXt8fPbRL/?lang=en>
4. PNUMA/ONU — Food Waste Index 2024 (mensagens-chave). <https://wedocs.unep.org/bitstream/handle/20.500.11822/45275/Food-Waste-Index-2024-key-messages_SP.pdf?sequence=2>
5. Compre Rural — "Por que quem mais trabalha no campo é quem menos ganha" (cita Cepea/Esalq). <https://comprerural.com/por-que-quem-mais-trabalha-no-campo-e-quem-menos-ganha-entenda/> *(confirmar no estudo original)*
6. Lei nº 15.226/2025 (PNAE 45%). <https://planalto.gov.br/ccivil_03/_Ato2023-2026/2025/Lei/L15226.htm>
7. Lei nº 15.224/2025 (PNCPDA, Selo Doador de Alimentos). <https://www.planalto.gov.br/CCIVIL_03/_Ato2023-2026/2025/Lei/L15224.htm>
8. Agência Gov / IBGE PNAD — acesso à internet rural 84,8%. <https://agenciagov.ebc.com.br/noticias/202507/acesso-a-internet-nas-areas-rurais-dispara-150-em-oito-anos-e-alcanca-84-8-da-populacao> · <https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-noticias/noticias/44032-no-brasil-88-9-da-populacao-de-10-anos-ou-mais-tinha-celular-em-2024>
9. CETIC.br — TIC Domicílios 2024, tabela C16B. <https://cetic.br/en/tics/domicilios/2024/individuos/C16B/>
10. Embrapa/Sebrae/Inpe — Agricultura Digital no Brasil (2020). <https://revistacultivar.com.br/noticias/pesquisa-inedita-revela-comportamento-do-produtor-rural-84-1-acessam-tecnologias-digitais>
11. Forbes Agro — Pesquisa ABMRA 2025: WhatsApp é o principal canal do agro. <https://forbes.com.br/forbesagro/2025/09/internet-atinge-98-das-propriedades-e-whatsapp-vira-principal-canal-do-agro-diz-nova-pesquisa-abmra/>
12. NeoFeed — Frubana encerra operações no Brasil. <https://neofeed.com.br/startups/frubana-que-captou-us-271-milhoes-encerra-operacoes-no-brasil/>
13. SENAR-MS/MAPA — Peste suína: orientações aos produtores. <https://senarms.org.br/sites/default/files/programa/PesteSuina_Produtores.pdf>
