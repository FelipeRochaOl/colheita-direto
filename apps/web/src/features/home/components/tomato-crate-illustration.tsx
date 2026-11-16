import { colors } from '@colheita/design-tokens';

const TOMATO_ROWS = 3;
const TOMATOS_PER_ROW = 5;

/** Tomate desenhado só com gradiente (sem imagem externa). `blemished` marca um defeito leve. */
function Tomato({ blemished = false }: { blemished?: boolean }) {
  return (
    <span
      className="relative block aspect-square rounded-full"
      style={{
        background: `radial-gradient(circle at 32% 28%, ${colors.produceRedLight} 0%, ${colors.produceRed} 38%, ${colors.produceRedDark} 100%)`,
        boxShadow: 'inset -4px -6px 10px rgba(0,0,0,0.18), 0 3px 6px rgba(0,0,0,0.25)',
      }}
    >
      {/* Cálice verde no topo */}
      <span
        className="absolute left-1/2 -translate-x-1/2 top-[6%] w-[34%] h-[16%] rounded-full"
        style={{ backgroundColor: colors.greenDark }}
      />
      {blemished && (
        <span
          className="absolute right-[22%] bottom-[24%] w-[22%] h-[18%] rounded-full opacity-80"
          style={{ backgroundColor: colors.crateWoodDark }}
        />
      )}
    </span>
  );
}

/**
 * Caixa de tomates vista de cima, com as caixas de detecção da visão computacional
 * e uma linha de "leitura" animada. É a prévia da classificação na página inicial.
 */
export function TomatoCrateIllustration({
  scanning = true,
  showLabels = true,
}: {
  scanning?: boolean;
  showLabels?: boolean;
}) {
  return (
    <div
      className="relative rounded-2xl p-3"
      style={{
        background: `repeating-linear-gradient(90deg, ${colors.crateWood} 0 46px, ${colors.crateWoodDark} 46px 48px)`,
        boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.12)',
      }}
    >
      <div
        className="grid gap-2 rounded-xl p-2"
        style={{
          gridTemplateColumns: `repeat(${TOMATOS_PER_ROW}, 1fr)`,
          backgroundColor: 'rgba(0,0,0,0.22)',
        }}
      >
        {Array.from({ length: TOMATO_ROWS * TOMATOS_PER_ROW }, (_, index) => (
          <Tomato key={index} blemished={index === 8} />
        ))}
      </div>

      {/* Detecções: duas boas e um defeito leve */}
      <DetectionBox
        className="left-[5%] top-[7%] w-[22%] h-[34%]"
        label={showLabels ? 'tomate 0,98' : undefined}
      />
      <DetectionBox
        className="left-[41%] top-[36%] w-[22%] h-[32%]"
        label={showLabels ? 'mancha leve' : undefined}
        tone="warning"
      />
      <DetectionBox
        className="left-[74%] top-[62%] w-[22%] h-[33%]"
        label={showLabels ? 'tomate 0,97' : undefined}
      />

      {scanning && (
        <span
          aria-hidden="true"
          className="animate-scan-line absolute inset-x-0 top-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.brandGreen}, transparent)`,
            boxShadow: `0 0 18px 4px ${colors.brandGreen}`,
          }}
        />
      )}
    </div>
  );
}

function DetectionBox({
  className,
  label,
  tone = 'ok',
}: {
  className: string;
  label?: string;
  tone?: 'ok' | 'warning';
}) {
  const color = tone === 'ok' ? colors.brandGreen : colors.warning;
  return (
    <span className={`absolute rounded-md ${className}`} style={{ border: `2px solid ${color}` }}>
      {label && (
        <span
          className="absolute -top-[22px] left-[-2px] px-1.5 py-0.5 rounded font-mono text-[10px] leading-none whitespace-nowrap"
          style={{ backgroundColor: color, color: colors.evergreenDark }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
