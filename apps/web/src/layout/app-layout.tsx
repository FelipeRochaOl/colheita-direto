import { ShoppingCartOutlined } from '@ant-design/icons';
import { Badge, Button, Dropdown } from 'antd';
import { Link, Outlet, useNavigate } from 'react-router';
import { useSession } from '../features/auth/hooks/use-session';
import { useCart } from '../features/cart/hooks/use-cart';

export function AppLayout() {
  const { session, hasRole, logout } = useSession();
  const { totalBoxes } = useCart();
  const navigate = useNavigate();

  const accountLinks = [
    hasRole('producer') && { key: '/produtor', label: 'Minha produção' },
    hasRole('buyer') && { key: '/pedidos', label: 'Meus pedidos' },
    hasRole('ngo') && { key: '/doacoes', label: 'Doações' },
    { key: '/cadastro', label: 'Adicionar perfil' },
    { key: 'logout', label: 'Sair' },
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-evergreen text-white">
        <nav className="max-w-[1416px] mx-auto px-4 h-16 flex items-center gap-6">
          <Link to="/" className="font-serif text-xl font-semibold text-white! whitespace-nowrap">
            Colheita <span className="text-brand">Direta</span>
          </Link>
          <Link to="/mercado" className="text-muted! hover:text-white!">Comprar</Link>
          <Link to="/impacto" className="text-muted! hover:text-white! hidden sm:inline">Impacto</Link>
          <div className="ml-auto flex items-center gap-4">
            <Link to="/carrinho" aria-label="Carrinho">
              <Badge count={totalBoxes} size="small">
                <ShoppingCartOutlined className="text-xl text-white!" />
              </Badge>
            </Link>
            {session ? (
              <Dropdown
                menu={{
                  items: accountLinks,
                  onClick: ({ key }) => (key === 'logout' ? void logout().then(() => navigate('/')) : navigate(key)),
                }}
              >
                <Button>{session.user.name ?? 'Minha conta'}</Button>
              </Dropdown>
            ) : (
              <Button type="primary" onClick={() => navigate('/entrar')}>Entrar</Button>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-evergreen text-muted text-sm">
        <div className="max-w-[1416px] mx-auto px-4 py-8 flex flex-wrap gap-4 justify-between">
          <span>Colheita Direta · do campo para a mesa, sem desperdício</span>
          <span>ODS 2 · 10 · 12 · 13</span>
        </div>
      </footer>
    </div>
  );
}
