# 03 · App mobile (React Native + Expo)

Padrão: componentes funcionais, React Query (`packages/api-client`), NativeWind com preset de `design-tokens`, `@ant-design/react-native` tematizado.

## MVP
- [x] Projeto Expo em `apps/mobile` com `screens/`, `features/`, `utils/` — **Pronto quando:** build dev em Android e iOS
- [ ] Providers: `QueryClientProvider`, tema AntD, navegação — **Pronto quando:** tema LeafyGreen aplicado em todas as telas _(compila e gera bundle; falta rodar em aparelho)_
- [ ] Login por telefone + OTP — **Pronto quando:** sessão persiste e renova token _(compila e gera bundle; falta rodar em aparelho)_
- [ ] Seleção de perfil (produtor / comprador / transportador) — **Pronto quando:** cada perfil vê sua navegação
- [ ] **Produtor:** câmera para lote (3 fotos guiadas), áudio opcional, ver classificação, publicar/ajustar preço/mudar destino — **Pronto quando:** lote publicado em ≤ 4 toques após a foto _(compila e gera bundle; falta rodar em aparelho)_
- [ ] Compressão de imagem antes do envio — **Pronto quando:** foto ≤ 500 KB mantendo precisão da classificação
- [ ] **Offline:** cache React Query persistido (MMKV) + fila de mutações reenviada ao reconectar (sem SQLite) — **Pronto quando:** lote criado sem sinal é enviado ao voltar a conexão _(compila e gera bundle; falta rodar em aparelho)_
- [ ] Push notifications (Expo + SNS) — **Pronto quando:** produtor recebe "novo pedido"

## v1
- [ ] **Comprador:** catálogo, filtro por distância, carrinho, pagamento Pix, rastreio — **Pronto quando:** pedido completo pelo app
- [ ] **Transportador:** fretes disponíveis na rota, aceite, check-in de coleta/entrega com foto — **Pronto quando:** entrega confirmada libera repasse
- [ ] Telas de gestão do produtor (regras em 10) — **Pronto quando:** produtor consulta estoque e extrato offline
- [ ] Diagnóstico de praga por foto (serviço em 05) — **Pronto quando:** resultado e orientação exibidos em < 15 s
- [ ] Acessibilidade: leitor de tela, fonte ampliável, contraste AA, botões ≥ 48 dp — **Pronto quando:** auditoria com TalkBack/VoiceOver sem bloqueios
- [ ] Testes de componentes (Testing Library) e e2e (Maestro/Detox) nos fluxos críticos — **Pronto quando:** rodam no CI

## Escala
- [ ] Publicação nas lojas com EAS e atualizações OTA — **Pronto quando:** release sem nova revisão de loja para correções JS
- [ ] Modo leve para aparelhos de entrada (Android Go) — **Pronto quando:** app roda fluido em aparelho de 2 GB RAM
