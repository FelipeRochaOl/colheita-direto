import { fontFamilies, layout } from '@colheita/design-tokens';
import { ReactNode } from 'react';

/** Container centralizado com a largura máxima e margens do grid do design system. */
export function PageSection({
  children,
  title,
  actions,
}: {
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}) {
  return (
    <section style={{ maxWidth: layout.maxContentWidth, margin: '0 auto', padding: '40px 16px' }}>
      {(title || actions) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          {title && (
            <h1
              style={{
                fontFamily: fontFamilies.serif,
                fontSize: 36,
                fontWeight: 400,
                letterSpacing: '-0.015em',
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              {title}
            </h1>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
