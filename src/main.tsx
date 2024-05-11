import './css/index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { createRoot } from 'react-dom/client';
import { WagmiProvider, createConfig, fallback, http, unstable_connector } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode, Suspense } from 'react';
import { config } from './config';
import {
  App,
  CollectionActivitiesPage,
  CollectionOrdersPage,
  CollectionPage,
  OrderCreatePage,
  OrderFulfillPage,
  OrderPage,
} from './pages';
import { ErrorPage, LoadingPage, NotFoundPage } from './pages/fallback';

const wagmiConfig = createConfig({
  chains: [config.eth.chain],
  connectors: [injected()],
  transports: {
    [config.eth.chain.id]: fallback([unstable_connector(injected), http(config.eth.rpc)]),
  },
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: true, retry: 0, staleTime: Infinity } },
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary fallbackRender={({ error }) => <ErrorPage error={error} />}>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route
                path="/c/:contract"
                element={
                  <StrictMode>
                    <App />
                  </StrictMode>
                }
              >
                <Route path="" Component={CollectionPage}>
                  <Route path="" Component={CollectionOrdersPage} />
                  <Route path="activity" Component={CollectionActivitiesPage} />
                </Route>
                <Route path="order" Component={OrderPage}>
                  <Route path="create/:tokenId" Component={OrderCreatePage} />
                  <Route path=":tokenId" Component={OrderFulfillPage} />
                </Route>
              </Route>
              <Route path="*" Component={NotFoundPage} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </WagmiProvider>,
);
