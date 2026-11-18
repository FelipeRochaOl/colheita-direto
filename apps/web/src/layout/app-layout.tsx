import { MenuOutlined, ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { colors } from '@colheita/design-tokens';
import { BrandLogo } from '@colheita/ui-web';
import { Badge, Button, Drawer, Dropdown, type MenuProps } from 'antd';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useSession } from '../features/auth/hooks/use-session';
import { useCart } from '../features/cart/hooks/use-cart';
import { ROLE_AREA_LINKS } from '../utils/role-home';

const PUBLIC_LINKS = [
  { to: '/mercado', label: 'Comprar' },
  { to: '/impacto', label: 'Impacto' },
];
const PRODUCER_INVITE_LINK = { to: '/cadastro?perfil=producer', label: 'Para produtores' };

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

  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fecha o menu do celular ao trocar de página
  useEffect(() => setIsMenuOpen(false), [location.pathname, location.search]);

  // Áreas do usuário logado ficam visíveis no topo, não escondidas no menu da conta
  const areaLinks = ROLE_AREA_LINKS.filter((link) => hasRole(link.role));
  const navigationLinks = [...PUBLIC_LINKS, ...(hasRole('producer') ? [] : [PRODUCER_INVITE_LINK])];

  const accountMenuItems: MenuProps['items'] = [
    { key: '/cadastro', label: 'Adicionar perfil' },
    { type: 'divider', key: 'divider' },
    { key: 'logout', label: 'Sair', danger: true },
  ];
  const handleAccountMenu = (key: string) =>
    key === 'logout' ? void logout().then(() => navigate('/')) : navigate(key);

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-full text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-brand ${
      isActive ? 'text-white! bg-white/10' : 'text-muted! hover:text-white! hover:bg-white/5'
    }`;
  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 rounded-xl text-base font-medium ${
      isActive ? 'bg-evergreen text-white!' : 'text-evergreen! hover:bg-surface'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-evergreen/90 backdrop-blur-md border-b border-white/5">
        <nav
          aria-label="Principal"
          className="max-w-[1416px] mx-auto px-4 sm:px-6 h-[72px] flex items-center gap-6"
        >
          <Button
            type="text"
            aria-label="Abrir menu"
            icon={<MenuOutlined className="text-xl text-white!" />}
            className="md:hidden! -ml-2"
            onClick={() => setIsMenuOpen(true)}
          />
          <Link to="/" aria-label="Colheita Direta, página inicial" className="shrink-0">
            <BrandLogo tone="light" size={30} />
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navigationLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
                {link.label}
              </NavLink>
            ))}
            {areaLinks.length > 0 && <span aria-hidden className="mx-2 h-5 w-px bg-white/15" />}
            {areaLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={desktopLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 sm:gap-5">
            <Link
              to="/carrinho"
              aria-label={`Carrinho, ${totalBoxes} caixas`}
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
                menu={{ items: accountMenuItems, onClick: ({ key }) => handleAccountMenu(key) }}
              >
                <Button
                  ghost
                  icon={<UserOutlined />}
                  aria-label="Minha conta"
                  className="border-white/30!"
                >
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
      <Drawer
        title="Menu"
        placement="left"
        width={300}
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      >
        <nav aria-label="Menu do celular" className="flex flex-col gap-1">
          {navigationLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={mobileLinkClass}>
              {link.label}
            </NavLink>
          ))}
          {areaLinks.length > 0 && (
            <div className="mt-4 mb-1 px-4 font-mono text-xs uppercase tracking-[0.14em] text-green-dark">
              Minhas áreas
            </div>
          )}
          {areaLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={mobileLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </Drawer>
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
