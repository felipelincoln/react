import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import {
  CollectionDetails,
  defaultCollection,
  supportedCollections,
} from '../collection/collections';
import NotFoundPage from './NotFound';
import { ReactElement, createContext } from 'react';
import { WagmiProvider, createConfig, http, useAccount } from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider, UseQueryResult, useQuery } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { Notification, With_Id } from '../packages/order/marketplaceProtocol';

type UseQueryUserTokenIdsResultData = UseQueryResult<{ data: { tokens: string[] } }>;
type UseQueryUserNotificationsResultData = UseQueryResult<{
  data: { notifications: With_Id<Notification>[] };
}>;

export const CollectionContext = createContext<CollectionDetails>(defaultCollection);
export const UserTokenIdsContext = createContext<string[]>([]);
export const UserNotificationsContext = createContext<With_Id<Notification>[]>([]);

export interface collectionLoaderData {
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

  const { data: userTokenIdsResult }: UseQueryUserTokenIdsResultData = useQuery({
    initialData: { data: { tokens: [] } },
    queryKey: ['user_token_ids'],
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection.key}/${userAddress}`).then((res) =>
        res.json(),
      ),
    enabled: isConnected,
  });

  const { data: notificationsResult }: UseQueryUserNotificationsResultData = useQuery({
    initialData: { data: { notifications: [] } },
    queryKey: ['user_notifications'],
    queryFn: () =>
      fetch(`http://localhost:3000/notifications/${collection.key}/${userAddress}`).then((res) =>
        res.json(),
      ),
    enabled: isConnected,
  });

  const userTokenIds = userTokenIdsResult.data.tokens;
  const userNotifications = notificationsResult.data.notifications;
  return (
    <CollectionContext.Provider value={collection}>
      <UserTokenIdsContext.Provider value={userTokenIds}>
        <UserNotificationsContext.Provider value={userNotifications}>
          {children}
        </UserNotificationsContext.Provider>
      </UserTokenIdsContext.Provider>
    </CollectionContext.Provider>
  );
}
