import './css/index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { createRoot } from 'react-dom/client';
import { WagmiProvider, createConfig, fallback, http, unstable_connector } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import { config } from './config';
import { App } from './App';
import { ErrorPage, LoadingPage, NotFoundPage } from './pages/fallback';
import { CollectionPage } from './pages';

const wagmiConfig = createConfig({
  chains: [config.eth.chain],
  connectors: [injected()],
  transports: {
    [config.eth.chain.id]: fallback([unstable_connector(injected), http(config.eth.rpc)]),
  },
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 0 } },
});

const root = createRoot(document.getElementById('root')!);
root.render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary fallbackRender={({ error }) => <ErrorPage error={error} />}>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path="/c/:contract" element={<App />}>
                <Route path="" element={<CollectionPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </WagmiProvider>,
);
