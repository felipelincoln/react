import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import {
  CollectionDetails,
  defaultCollection,
  supportedCollections,
} from '../collection/collections';
import NotFoundPage from './NotFound';
import { ReactElement, createContext, useContext } from 'react';
import { WagmiProvider, createConfig, http, useAccount } from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider, UseQueryResult, useQuery } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';

type UseQueryResultData = UseQueryResult<{ data: { tokens: string[] } }>;

export const CollectionContext = createContext<CollectionDetails>(defaultCollection);
export const UserTokenIdsContext = createContext<string[]>([]);

interface collectionLoaderData {
  collection: CollectionDetails | undefined;
}

export function collectionLoader({ params }: LoaderFunctionArgs): collectionLoaderData {
  const collectionSlug = params.collectionName!;
  const collection = supportedCollections[collectionSlug];

  return { collection };
}

export default function App({ children }: { children: ReactElement[] | ReactElement }) {
  const wagmiConfig = createConfig({
    chains: [mainnet, sepolia],
    connectors: [injected()],
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });

  const wagmiQueryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={wagmiQueryClient}>
        <AppContextProvider>{children}</AppContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function AppContextProvider({ children }: { children: ReactElement[] | ReactElement }) {
  const { collection } = useLoaderData() as collectionLoaderData;
  const { address: userAddress, isConnected } = useAccount();

  if (!collection) {
    return <NotFoundPage></NotFoundPage>;
  }

  const { data: result }: UseQueryResultData = useQuery({
    initialData: { data: { tokens: [] } },
    queryKey: ['user_token_ids'],
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection.key}/${userAddress}`).then((res) =>
        res.json(),
      ),
    enabled: isConnected,
  });

  const userTokenIds = result.data.tokens;
  return (
    <CollectionContext.Provider value={collection}>
      <UserTokenIdsContext.Provider value={userTokenIds}>{children}</UserTokenIdsContext.Provider>
    </CollectionContext.Provider>
  );
}
