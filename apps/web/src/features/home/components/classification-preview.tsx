import { CheckCircleFilled, ThunderboltFilled } from '@ant-design/icons';
import { MoneyText, QualityGradeBadge } from '@colheita/ui-web';
import { TomatoCrateIllustration } from './tomato-crate-illustration';

/** Prévia do produto no topo da página inicial: foto → classe → preço sugerido. Valores ilustrativos. */
export function ClassificationPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <div className="relative rounded-[28px] bg-white text-evergreen p-4 sm:p-5 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
        <div className="flex items-center justify-between px-1 pb-3">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-border-active">
              Lote #128
            </div>
            <div className="font-semibold text-[17px]">Tomate italiano · 30 caixas</div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-xs font-semibold text-green-dark">
            <ThunderboltFilled /> IA classificou
          </span>
        </div>

        <TomatoCrateIllustration />

        <div className="mt-4 flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-black/5">
          <QualityGradeBadge grade="A" size="large" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold">Classe A</div>
            <div className="text-sm text-border-active">Padrão comercial · 1 defeito leve</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-border-active">
              Preço sugerido
            </div>
            <div className="font-serif text-2xl leading-tight text-green-dark">
              <MoneyText value={84} />
            </div>
            <div className="text-xs text-border-active">por caixa</div>
          </div>
        </div>
      </div>

      {/* Cartões flutuantes: o que acontece depois da classificação */}
      <div className="animate-float-soft absolute -left-4 sm:-left-16 top-[46%] rounded-2xl bg-teal-dark text-white px-4 py-3 shadow-xl ring-1 ring-green-dark max-w-[210px]">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Pix recebido
        </div>
        <div className="font-serif text-2xl text-brand leading-tight">
          <MoneyText value={2520} />
        </div>
        <div className="text-xs text-muted">direto na conta do produtor</div>
      </div>
      <div
        className="animate-float-soft absolute -right-3 sm:-right-10 -bottom-12 rounded-2xl bg-white text-evergreen px-4 py-3 shadow-xl ring-1 ring-black/5 flex items-center gap-3"
        style={{ animationDelay: '1.5s' }}
      >
        <CheckCircleFilled className="text-green-medium! text-xl" />
        <div>
          <div className="text-sm font-semibold">Vendido para Restaurante Sabor</div>
          <div className="text-xs text-border-active">a 45 km · frete incluso</div>
        </div>
      </div>
    </div>
  );
}
