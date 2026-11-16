import { layout } from '@colheita/design-tokens';
import { ReactNode } from 'react';

/** Container centralizado com a largura máxima e margens do grid do design system. */
export function PageSection({ children, title, actions }: { children: ReactNode; title?: string; actions?: ReactNode }) {
  return (
    <section style={{ maxWidth: layout.maxContentWidth, margin: '0 auto', padding: '32px 16px' }}>
      {(title || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {title && <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>{title}</h1>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
