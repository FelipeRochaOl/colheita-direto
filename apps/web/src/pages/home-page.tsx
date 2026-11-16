import {
  ArrowRightOutlined,
  AudioOutlined,
  BranchesOutlined,
  CameraOutlined,
  CarOutlined,
  CheckOutlined,
  HeartOutlined,
  ScanOutlined,
  ShopOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import type { QualityGrade } from '@colheita/contracts';
import { gradients } from '@colheita/design-tokens';
import { AnimatedNumber, PercentText, QualityGradeBadge } from '@colheita/ui-web';
import { Button } from 'antd';
import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { ClassificationPreview } from '../features/home/components/classification-preview';
import { WhatsAppChatPreview } from '../features/home/components/whatsapp-chat-preview';
import { ImpactIndicatorsPanel } from '../features/impact/components/impact-indicators-panel';

/** Números do problema, com fonte em docs/concepcao.md §8. */
const millionFormatter = (value: number) =>
  `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} mi`;
const plainIntegerFormatter = (value: number) => String(Math.round(value));

const PROBLEM_FIGURES: Array<{ key: string; value: ReactNode; label: string; source: string }> = [
  {
    key: 'propriedades',
    value: <AnimatedNumber value={3.9} decimalPlaces={1} format={millionFormatter} />,
    label: 'propriedades de agricultura familiar no Brasil',
    source: 'IBGE, Censo Agro',
  },
  {
    key: 'perda',
    value: (
      <>
        <AnimatedNumber value={30} format={plainIntegerFormatter} />–<PercentText percent={40} />
      </>
    ),
    label: 'de perda pós-colheita em frutas e hortaliças',
    source: 'Embrapa',
  },
  {
    key: 'pnae',
    value: <PercentText percent={45} />,
    label: 'da merenda escolar (PNAE) vinda da agricultura familiar a partir de 2026',
    source: 'Lei 15.226/2025',
  },
];

const HOW_IT_WORKS = [
  {
    icon: <CameraOutlined />,
    title: 'Foto da colheita',
    text: 'O produtor fotografa as caixas pelo app ou manda direto no WhatsApp.',
  },
  {
    icon: <ScanOutlined />,
    title: 'Classificação A–D',
    text: 'A visão computacional avalia a qualidade, aponta defeitos e sugere o preço.',
  },
  {
    icon: <BranchesOutlined />,
    title: 'Destino certo',
    text: 'Cada lote vai para venda, indústria ou doação, sem nada parado no galpão.',
  },
  {
    icon: <WalletOutlined />,
    title: 'Frete e Pix',
    text: 'Transporte da região no mesmo pedido e pagamento dividido na hora.',
  },
];

const GRADE_DESTINATIONS: Array<{
  grade: QualityGrade;
  title: string;
  destination: string;
  price: ReactNode;
  text: string;
}> = [
  {
    grade: 'A',
    title: 'Padrão comercial',
    destination: 'Mercado',
    price: 'Preço cheio',
    text: 'Restaurantes, varejo de bairro e consumidor final.',
  },
  {
    grade: 'B',
    title: 'Defeito estético leve',
    destination: 'Mercado com desconto',
    price: (
      <>
        −<PercentText percent={25} />
      </>
    ),
    text: 'Mesmo sabor, aparência imperfeita: vende rápido.',
  },
  {
    grade: 'C',
    title: 'Para processar',
    destination: 'Indústria',
    price: (
      <>
        −<PercentText percent={60} />
      </>
    ),
    text: 'Molhos, polpas e conservas usam como insumo.',
  },
  {
    grade: 'D',
    title: 'Fora do padrão de venda',
    destination: 'Doação',
    price: 'Banco de alimentos',
    text: 'ONGs próximas são avisadas na hora. Nunca vira lixo.',
  },
];

const AUDIENCES = [
  {
    icon: <ShopOutlined />,
    role: 'producer',
    title: 'Produtor',
    text: 'Venda direto, receba no Pix e controle colheita, estoque e despesas.',
    points: [
      'Classificação e preço por foto',
      'Tudo pelo WhatsApp, até por áudio',
      'Funciona sem internet no app',
    ],
    cta: 'Começar a vender',
  },
  {
    icon: <CheckOutlined />,
    role: 'buyer',
    title: 'Comprador',
    text: 'Restaurantes, mercados, indústria e prefeituras comprando da região.',
    points: [
      'Qualidade garantida por classe',
      'Frete com transportador local',
      'Pagamento por Pix',
    ],
    cta: 'Quero comprar',
  },
  {
    icon: <CarOutlined />,
    role: 'service_provider',
    title: 'Transporte e serviços',
    text: 'Fretes, câmaras frias e embaladoras recebendo pedidos da vizinhança.',
    points: ['Pedidos já com rota e carga', 'Recebe no split do Pix', 'Sem intermediário'],
    cta: 'Oferecer serviços',
  },
  {
    icon: <HeartOutlined />,
    role: 'ngo',
    title: 'ONG e banco de alimentos',
    text: 'Receba doações de alimento próprio para consumo, perto de você.',
    points: ['Aviso na hora da doação', 'Retirada combinada no app', 'Relatório de impacto'],
    cta: 'Receber doações',
  },
];

function SectionHeading({
  eyebrow,
  title,
  text,
  tone = 'dark',
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <div className="max-w-2xl">
      <div
        className={`font-mono text-xs uppercase tracking-[0.16em] ${tone === 'light' ? 'text-brand' : 'text-green-dark'}`}
      >
        {eyebrow}
      </div>
      <h2
        className={`mt-4 font-serif font-light text-4xl sm:text-5xl leading-[1.05] tracking-[-0.02em] ${
          tone === 'light' ? 'text-white' : 'text-evergreen'
        }`}
      >
        {title}
      </h2>
      {text && (
        <p
          className={`mt-5 text-lg leading-relaxed ${tone === 'light' ? 'text-muted' : 'text-border-active'}`}
        >
          {text}
        </p>
      )}
    </div>
  );
}

const CONTAINER = 'max-w-[1416px] mx-auto px-4 sm:px-6';

export function HomePage() {
  const navigate = useNavigate();
  return (
    <>
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-evergreen text-white rounded-b-[48px] sm:rounded-b-[80px]"
        style={{ backgroundImage: gradients.heroGlow }}
      >
        <div
          className={`${CONTAINER} grid items-center gap-16 pt-14 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20 lg:pb-28`}
        >
          <div className="animate-rise-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2 pr-4 text-sm text-muted">
              <span className="rounded-full bg-brand px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-evergreen">
                Novo
              </span>
              Classificação da colheita por foto com IA
            </span>
            <h1 className="mt-7 font-serif font-light text-[44px] leading-[1.02] tracking-[-0.025em] sm:text-6xl lg:text-[76px]">
              Direto do produtor.
              <span
                className="block italic font-normal"
                style={{
                  backgroundImage: gradients.heroTitle,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Sem atravessador, sem desperdício.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
              O pequeno produtor fotografa a colheita, a inteligência artificial classifica a
              qualidade e encontra o melhor destino para cada caixa: venda, indústria ou doação.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                type="primary"
                size="large"
                className="h-13! px-7! text-base!"
                onClick={() => navigate('/mercado')}
              >
                Comprar do produtor <ArrowRightOutlined />
              </Button>
              <Button
                size="large"
                ghost
                className="h-13! px-7! text-base! border-white/30!"
                onClick={() => navigate('/cadastro?perfil=producer')}
              >
                Sou produtor
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              {[
                'Pix com split automático',
                'Atendimento no WhatsApp',
                'Frete da própria região',
              ].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckOutlined className="text-brand!" /> {item}
                </span>
              ))}
            </div>
          </div>
          <div className="animate-rise-in px-4 sm:px-10" style={{ animationDelay: '120ms' }}>
            <ClassificationPreview />
          </div>
        </div>

        <div className={`${CONTAINER} pb-14 lg:pb-20`}>
          <div className="grid rounded-3xl border border-white/10 bg-white/[0.02] divide-y divide-white/10 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            {PROBLEM_FIGURES.map((figure) => (
              <div key={figure.key} className="p-6 sm:p-8">
                <div className="font-serif text-4xl font-light text-brand sm:text-5xl">
                  {figure.value}
                </div>
                <div className="mt-2 text-white/90">{figure.label}</div>
                <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted/70">
                  {figure.source}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className={`${CONTAINER} py-24 sm:py-32`}>
        <SectionHeading
          eyebrow="Como funciona"
          title={
            <>
              Um gesto decide <em className="text-green-dark">qualidade, preço e destino</em>
            </>
          }
          text="Vender e combater o desperdício viram o mesmo fluxo. O produtor não preenche formulário: tira uma foto."
        />
        <ol className="relative mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-mint-strong lg:block"
          />
          {HOW_IT_WORKS.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="relative grid size-14 place-items-center rounded-2xl bg-evergreen text-2xl text-brand ring-8 ring-surface">
                {step.icon}
              </span>
              <div className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-green-dark">
                Passo {index + 1}
              </div>
              <h3 className="mt-2 text-xl font-semibold text-evergreen">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-border-active">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Destino por classe */}
      <section className="bg-deep-dark rounded-[48px] sm:rounded-[80px] mx-2 sm:mx-4">
        <div className={`${CONTAINER} py-24 sm:py-28`}>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading
              tone="light"
              eyebrow="Visão computacional"
              title={
                <>
                  Cada caixa no <em className="text-brand">destino certo</em>
                </>
              }
              text="A classe define para onde o lote vai. Fruta feia não é desperdício: é preço diferente ou comida na mesa de quem precisa."
            />
            <Link
              to="/mercado"
              className="inline-flex items-center gap-2 text-white! hover:text-brand! transition-colors"
            >
              Ver ofertas agora <ArrowRightOutlined />
            </Link>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {GRADE_DESTINATIONS.map((item) => (
              <div
                key={item.grade}
                className="group flex flex-col rounded-[28px] border border-border-subtle bg-card-dark/40 p-7 transition-colors hover:border-green-dark hover:bg-teal-dark/60"
              >
                <div className="flex items-center justify-between">
                  <QualityGradeBadge grade={item.grade} size="large" />
                  <span className="rounded-full bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                    {item.price}
                  </span>
                </div>
                <div className="mt-8 text-sm text-muted">{item.title}</div>
                <div className="mt-1 font-serif text-3xl font-light text-white">
                  {item.destination}
                </div>
                <p className="mt-3 leading-relaxed text-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section className={`${CONTAINER} py-24 sm:py-32`}>
        <SectionHeading
          eyebrow="Para quem"
          title={
            <>
              Uma rede inteira, <em className="text-green-dark">sem atravessador</em>
            </>
          }
          text="Quem planta, quem compra, quem transporta e quem distribui doações, conectados no mesmo pedido."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {AUDIENCES.map((audience) => (
            <Link
              key={audience.role}
              to={`/cadastro?perfil=${audience.role}`}
              className="group flex flex-col rounded-[28px] bg-white p-7 text-evergreen! ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(0,30,43,0.35)]"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-mint text-xl text-green-dark">
                {audience.icon}
              </span>
              <h3 className="mt-6 font-serif text-2xl font-normal">{audience.title}</h3>
              <p className="mt-2 leading-relaxed text-border-active">{audience.text}</p>
              <ul className="mt-5 space-y-2 text-[15px]">
                {audience.points.map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <CheckOutlined className="mt-1 text-green-medium!" /> {point}
                  </li>
                ))}
              </ul>
              <span className="mt-auto pt-8 inline-flex items-center gap-2 font-semibold text-green-dark">
                {audience.cta}
                <ArrowRightOutlined className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* WhatsApp + IA */}
      <section className="bg-mint">
        <div className={`${CONTAINER} grid items-center gap-16 py-24 sm:py-28 lg:grid-cols-2`}>
          <div>
            <SectionHeading
              eyebrow="Inteligência artificial"
              title={
                <>
                  O produtor fala. <em className="text-green-dark">O Claude resolve.</em>
                </>
              }
              text="Um agente de IA no WhatsApp entende áudio, cria o lote, confirma o destino e anota as despesas. Quem está na roça não precisa aprender um aplicativo novo."
            />
            <ul className="mt-10 space-y-5">
              {[
                {
                  icon: <AudioOutlined />,
                  title: 'Entende áudio',
                  text: 'Fala do jeito de sempre, a IA transcreve e organiza.',
                },
                {
                  icon: <CameraOutlined />,
                  title: 'Foto vira anúncio',
                  text: 'Classe, defeitos e preço em segundos.',
                },
                {
                  icon: <WalletOutlined />,
                  title: 'Avisa cada venda',
                  text: 'Pedido pago, frete agendado e Pix na conta.',
                },
              ].map((feature) => (
                <li key={feature.title} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-lg text-green-dark ring-1 ring-black/5">
                    {feature.icon}
                  </span>
                  <div>
                    <div className="font-semibold text-evergreen">{feature.title}</div>
                    <div className="text-border-active">{feature.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <WhatsAppChatPreview />
        </div>
      </section>

      {/* Impacto */}
      <section className="bg-evergreen">
        <div className={`${CONTAINER} py-24 sm:py-28`}>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHeading
              tone="light"
              eyebrow="Impacto em tempo real"
              title={
                <>
                  Medido desde a <em className="text-brand">primeira caixa</em>
                </>
              }
            />
            <Link
              to="/impacto"
              className="inline-flex items-center gap-2 text-white! hover:text-brand! transition-colors"
            >
              Painel completo <ArrowRightOutlined />
            </Link>
          </div>
          <div className="mt-12">
            <ImpactIndicatorsPanel />
          </div>
        </div>
      </section>

      {/* Chamada final */}
      <section className="bg-evergreen pb-20">
        <div className={CONTAINER}>
          <div
            className="relative overflow-hidden rounded-[40px] px-8 py-16 sm:px-16 sm:py-20 ring-1 ring-green-dark/60"
            style={{ backgroundImage: gradients.ctaBand }}
          >
            <h2 className="max-w-3xl font-serif text-4xl font-light leading-[1.05] tracking-[-0.02em] text-white sm:text-6xl">
              Sua próxima colheita já tem{' '}
              <em
                style={{
                  backgroundImage: gradients.bannerTitle,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                comprador.
              </em>
            </h2>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Cadastro em dois minutos, pelo celular. Sem mensalidade para o produtor.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                type="primary"
                size="large"
                className="h-13! px-7! text-base!"
                onClick={() => navigate('/cadastro?perfil=producer')}
              >
                Cadastrar minha produção
              </Button>
              <Button
                size="large"
                ghost
                className="h-13! px-7! text-base! border-white/30!"
                onClick={() => navigate('/mercado')}
              >
                Ver o mercado
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
