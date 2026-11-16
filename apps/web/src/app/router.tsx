import { createBrowserRouter } from 'react-router';
import { RequireRole } from '../features/auth/components/require-role';
import { AppLayout } from '../layout/app-layout';
import { BuyerOrdersPage } from '../pages/buyer-orders-page';
import { CartPage } from '../pages/cart-page';
import { HomePage } from '../pages/home-page';
import { ImpactPage } from '../pages/impact-page';
import { LoginPage } from '../pages/login-page';
import { MarketplacePage } from '../pages/marketplace-page';
import { NgoPage } from '../pages/ngo-page';
import { OfferPage } from '../pages/offer-page';
import { ProducerPage } from '../pages/producer-page';
import { SignupPage } from '../pages/signup-page';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/mercado', element: <MarketplacePage /> },
      { path: '/mercado/:offerId', element: <OfferPage /> },
      { path: '/carrinho', element: <CartPage /> },
      { path: '/impacto', element: <ImpactPage /> },
      { path: '/entrar', element: <LoginPage /> },
      { path: '/cadastro', element: <SignupPage /> },
      { path: '/produtor', element: <RequireRole role="producer"><ProducerPage /></RequireRole> },
      { path: '/pedidos', element: <RequireRole role="buyer"><BuyerOrdersPage /></RequireRole> },
      { path: '/doacoes', element: <RequireRole role="ngo"><NgoPage /></RequireRole> },
    ],
  },
]);
