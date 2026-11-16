import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { colors } from '@colheita/design-tokens';
import { BrandLogo } from '@colheita/ui-web';
import { Badge, Button, Dropdown, type MenuProps } from 'antd';
import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import { useSession } from '../features/auth/hooks/use-session';
import { useCart } from '../features/cart/hooks/use-cart';

const NAVIGATION_LINKS = [
  { to: '/mercado', label: 'Comprar' },
  { to: '/impacto', label: 'Impacto' },
  { to: '/cadastro?perfil=producer', label: 'Para produtores' },
];

const FOOTER_COLUMNS = [
  {
    title: 'Plataforma',
    links: [
      { to: '/mercado', label: 'Comprar do produtor' },
      { to: '/impacto', label: 'Painel de impacto' },
      { to: '/entrar', label: 'Entrar' },
    ],
  },
  {
    title: 'Participe',
    links: [
      { to: '/cadastro?perfil=producer', label: 'Sou produtor' },
      { to: '/cadastro?perfil=buyer', label: 'Sou comprador' },
      { to: '/cadastro?perfil=service_provider', label: 'Transporte e serviços' },
      { to: '/cadastro?perfil=ngo', label: 'Sou ONG' },
    ],
  },
];

const SUSTAINABLE_DEVELOPMENT_GOALS = [
  '2 · Fome zero',
  '10 · Menos desigualdade',
  '12 · Consumo responsável',
  '13 · Ação climática',
];

export function AppLayout() {
  const { session, hasRole, logout } = useSession();
  const { totalBoxes } = useCart();
  const navigate = useNavigate();

  const accountLinks = [
    hasRole('producer') && { key: '/produtor', label: 'Minha produção' },
    hasRole('buyer') && { key: '/pedidos', label: 'Meus pedidos' },
    hasRole('ngo') && { key: '/doacoes', label: 'Doações' },
    { key: '/cadastro', label: 'Adicionar perfil' },
    { type: 'divider' as const, key: 'divider' },
    { key: 'logout', label: 'Sair', danger: true },
  ].filter(Boolean) as MenuProps['items'];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-evergreen/90 backdrop-blur-md border-b border-white/5">
        <nav className="max-w-[1416px] mx-auto px-4 sm:px-6 h-[72px] flex items-center gap-8">
          <Link to="/" aria-label="Colheita Direta, página inicial" className="shrink-0">
            <BrandLogo tone="light" size={30} />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAVIGATION_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-[15px] font-medium transition-colors ${
                    isActive
                      ? 'text-white! bg-white/10'
                      : 'text-muted! hover:text-white! hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <Link
              to="/carrinho"
              aria-label="Carrinho"
              className="size-10 grid place-items-center rounded-full hover:bg-white/10 transition-colors"
            >
              <Badge
                count={totalBoxes}
                size="small"
                color={colors.brandGreen}
                style={{ color: colors.evergreenDark, fontWeight: 600 }}
              >
                <ShoppingCartOutlined className="text-xl text-white!" />
              </Badge>
            </Link>
            {session ? (
              <Dropdown
                trigger={['click']}
                menu={{
                  items: accountLinks,
                  onClick: ({ key }) =>
                    key === 'logout' ? void logout().then(() => navigate('/')) : navigate(key),
                }}
              >
                <Button ghost icon={<UserOutlined />} className="border-white/30!">
                  <span className="hidden sm:inline">{session.user.name ?? 'Minha conta'}</span>
                </Button>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={() => navigate('/entrar')}>
                Entrar
              </Button>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-deep-dark text-muted">
        <div className="max-w-[1416px] mx-auto px-4 sm:px-6 pt-16 pb-10">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
            <div className="max-w-sm">
              <BrandLogo tone="light" size={34} />
              <p className="mt-5 leading-relaxed">
                Do campo para a mesa, sem atravessador e sem desperdício. Cada caixa colhida
                encontra o destino certo.
              </p>
            </div>
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <div className="font-mono text-xs uppercase tracking-[0.14em] text-brand">
                  {column.title}
                </div>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        className="text-muted! hover:text-white! transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-14 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-sm">
            <span>© {new Date().getFullYear()} Colheita Direta · FIAP Global Solution</span>
            <div className="flex flex-wrap gap-2">
              {SUSTAINABLE_DEVELOPMENT_GOALS.map((goal) => (
                <span key={goal} className="px-3 py-1 rounded-full border border-white/10 text-xs">
                  ODS {goal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
