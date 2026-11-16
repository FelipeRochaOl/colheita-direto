import { CountUp } from 'countup.js';
import { CSSProperties, useEffect, useRef } from 'react';

const ANIMATION_DURATION_SECONDS = 1.4;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Número que conta de 0 até o valor (countup.js) quando entra na tela, e anima de um valor
 * para o outro quando muda (ex.: total do carrinho). Respeita "reduzir movimento" do sistema.
 */
export function AnimatedNumber({
  value,
  format,
  decimalPlaces = 0,
  style,
  className,
}: {
  value: number;
  format: (value: number) => string;
  decimalPlaces?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<CountUp | null>(null);
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (prefersReducedMotion()) {
      element.textContent = format(value);
      return;
    }

    if (counterRef.current) {
      counterRef.current.update(value);
      return;
    }

    const counter = new CountUp(element, value, {
      startVal: 0,
      decimalPlaces,
      duration: ANIMATION_DURATION_SECONDS,
      formattingFn: (frameValue) => formatRef.current(frameValue),
    });
    if (counter.error) {
      element.textContent = format(value);
      return;
    }
    counterRef.current = counter;

    // Só começa a contar quando o número aparece na tela.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          counter.start();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span
      ref={elementRef}
      style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', ...style }}
      className={className}
    >
      {format(prefersReducedMotion() ? value : 0)}
    </span>
  );
}

const weightFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });

export function formatWeight(kilograms: number): string {
  return `${weightFormatter.format(kilograms)} kg`;
}

export function formatPercent(percent: number): string {
  return `${Math.round(percent)}%`;
}

/** Peso em kg animado. */
export function WeightText({ kilograms, className }: { kilograms: number; className?: string }) {
  return <AnimatedNumber value={kilograms} format={formatWeight} className={className} />;
}

/** Porcentagem animada. Recebe o valor já em % (ex.: 32 para 32%). */
export function PercentText({ percent, className }: { percent: number; className?: string }) {
  return <AnimatedNumber value={percent} format={formatPercent} className={className} />;
}
