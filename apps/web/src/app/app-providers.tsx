import { StyleProvider } from '@ant-design/cssinjs';
import { ApiClientProvider } from '@colheita/api-client';
import { antDesignTheme } from '@colheita/design-tokens';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntdApp, ConfigProvider } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import { ReactNode } from 'react';
import { SessionProvider } from '../features/auth/hooks/use-session';
import { CartProvider } from '../features/cart/hooks/use-cart';
import { apiClient } from './api-client';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StyleProvider layer>
      <ConfigProvider theme={antDesignTheme} locale={ptBR}>
        <AntdApp>
          <QueryClientProvider client={queryClient}>
            <ApiClientProvider client={apiClient}>
              <SessionProvider>
                <CartProvider>{children}</CartProvider>
              </SessionProvider>
            </ApiClientProvider>
          </QueryClientProvider>
        </AntdApp>
      </ConfigProvider>
    </StyleProvider>
  );
}
