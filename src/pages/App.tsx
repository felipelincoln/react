import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import {
  CollectionDetails,
  defaultCollection,
  supportedCollections,
} from '../collection/collections';
import NotFoundPage from './NotFound';
import { ReactElement, createContext } from 'react';
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useEnsAddress,
  useEnsName,
} from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider, UseQueryResult, useQuery } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import { Notification, With_Id } from '../packages/order/marketplaceProtocol';
import { ActivityButton, Button } from './Components';
import { EthereumNetwork, config } from '../config';

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
          <Navbar />
          {children}
        </UserNotificationsContext.Provider>
      </UserTokenIdsContext.Provider>
    </CollectionContext.Provider>
  );
}

function Navbar() {
  return (
    <div className="h-24 flex px-8">
      <div className="my-4 h-16 w-16 bg-zinc-700 rounded"></div>
      <div className="flex h-8 my-8 flex-grow justify-end gap-4">
        <ActivityButton count={2}></ActivityButton>
        <Button disabled>10 RACCOOL</Button>
        <Button disabled>3,85 ETH</Button>
        <ConnectButton />
      </div>
    </div>
  );
}

function ConnectButton() {
  const { connect, isPending } = useConnect();
  const { isConnected, isConnecting, address } = useAccount();
  const {
    data: ensName,
    isFetching: isFetchingEns,
    isFetched: isFetchedEns,
  } = useEnsName({ address });

  if (isPending || isConnecting || isFetchingEns) {
    return <Button disabled>Pending...</Button>;
  }

  if (isConnected && isFetchedEns) {
    if (!address) throw new Error('Missing address');
    let shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
    return <Button>{ensName ?? shortAddress}</Button>;
  }

  const chainId = (() => {
    switch (config.ethereumNetwork) {
      case EthereumNetwork.Mainnet:
        return mainnet.id;
      case EthereumNetwork.Sepolia:
        return sepolia.id;
      default:
        throw new Error(`Invalid Ethereum Network: ${config.ethereumNetwork}`);
    }
  })();

  let onClick = () => connect({ connector: injected(), chainId });
  return <Button onClick={onClick}>Connect</Button>;
}
