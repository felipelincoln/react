import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { CollectionDetails, defaultCollection, supportedCollections } from '../collections';
import NotFoundPage from './NotFound';
import { ReactElement, createContext } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, metaMask } from 'wagmi/connectors';

export const CollectionContext = createContext<CollectionDetails>(defaultCollection);

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

const wagmiQueryClient = new QueryClient();

export function collectionLoader({ params }: LoaderFunctionArgs) {
  const collectionSlug = params.collectionName!;
  const collection = supportedCollections[collectionSlug];

  return { collection };
}

export default function App({ children }: { children: ReactElement[] }) {
  const { collection } = useLoaderData() as { collection: CollectionDetails | undefined };

  if (!collection) {
    return <NotFoundPage></NotFoundPage>;
  }

  return (
    <CollectionContext.Provider value={collection}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={wagmiQueryClient}>{children}</QueryClientProvider>
      </WagmiProvider>
    </CollectionContext.Provider>
  );
}
