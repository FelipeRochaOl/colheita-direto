import { gradients } from '@colheita/design-tokens';
import { PageSection } from '@colheita/ui-web';
import { Button } from 'antd';
import { useNavigate } from 'react-router';
import { ImpactIndicatorsPanel } from '../features/impact/components/impact-indicators-panel';

const HOW_IT_WORKS = [
  { step: '1', title: 'Foto da colheita', text: 'O produtor manda fotos pelo WhatsApp ou pelo app.' },
  { step: '2', title: 'Classificação A–D', text: 'A visão computacional avalia a qualidade e sugere o preço.' },
  { step: '3', title: 'Destino certo', text: 'A e B vão para venda, C para a indústria e D para doação.' },
  { step: '4', title: 'Frete e Pix', text: 'Transporte da região e pagamento dividido na hora.' },
];

export function HomePage() {
  const navigate = useNavigate();
  return (
    <>
      <section className="bg-deep-dark text-white rounded-b-[72px]">
        <div className="max-w-[1416px] mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-tight max-w-4xl mx-auto">
            Direto do produtor.{' '}
            <span style={{ backgroundImage: gradients.heroTitle, WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Sem atravessador, sem desperdício.
            </span>
          </h1>
          <p className="text-muted text-lg mt-6 max-w-2xl mx-auto">
            O pequeno produtor fotografa a colheita, a inteligência artificial classifica a qualidade e encontra o melhor
            destino para cada caixa: venda, indústria ou doação.
          </p>
          <div className="mt-10 flex gap-4 justify-center flex-wrap">
            <Button type="primary" size="large" onClick={() => navigate('/mercado')}>Comprar do produtor</Button>
            <Button size="large" ghost onClick={() => navigate('/cadastro?perfil=producer')}>Sou produtor</Button>
          </div>
        </div>
      </section>
      <PageSection title="Como funciona">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="bg-white rounded-md p-6 border border-muted/40">
              <div className="text-green-dark font-semibold text-3xl">{item.step}</div>
              <div className="font-semibold text-lg mt-2">{item.title}</div>
              <p className="text-border-active mt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </PageSection>
      <section className="bg-evergreen">
        <PageSection>
          <h2 className="text-white text-2xl font-semibold mb-6">Impacto até agora</h2>
          <ImpactIndicatorsPanel />
        </PageSection>
      </section>
    </>
  );
}
