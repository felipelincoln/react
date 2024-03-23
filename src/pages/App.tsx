import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import {
  CollectionDetails,
  defaultCollection,
  supportedCollections,
} from '../collection/collections';
import NotFoundPage from './NotFound';
import { ReactElement, createContext, useContext } from 'react';
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
import { formatEther } from 'viem';
import { etherToString } from '../packages/utils';
import { useQueryUserTokenIds } from '../hooks/useQueryUserTokenIds';

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
      [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/Y8rL2bPTVaAg5E-vr47ab4g-kP5ZjTTL'),
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
  const collection = useContext(CollectionContext);
  const { data: userTokenIdsResult, isFetching: isUserTokenIdsFetching } = useQueryUserTokenIds({
    collection,
  });
  const userNotifications = useContext(UserNotificationsContext);
  const { isConnected, address } = useAccount();
  const { data: balance, isLoading: isLoadingBalance } = useBalance({ address });

  const userTokenIds = userTokenIdsResult || [];

  let buttons = [<UserButton key="1" onClick={() => console.log('TODO')} />];
  if (isConnected) {
    let userTokens = `${userTokenIds?.length} ${collection.symbol}`;
    let userEth = etherToString(balance?.value);

    buttons = [
      <Button key="2" disabled loading={!!isUserTokenIdsFetching}>
        <span>{userTokens}</span>
      </Button>,
      <Button key="3" disabled loading={!!isLoadingBalance}>
        <span>{userEth}</span>
      </Button>,
      <ActivityButton key="4" count={userNotifications.length}></ActivityButton>,
      ...buttons,
    ];
  }

  return (
    <div className="h-24 flex px-8 border-b-2 border-zinc-800">
      <div className="my-4 h-16 w-16 bg-zinc-800 rounded"></div>
      <div className="flex h-8 my-8 flex-grow justify-end gap-4">{buttons}</div>
    </div>
  );
}

function UserButton({ onClick }: { onClick: Function }) {
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();
  const {
    data: ensName,
    isFetching: isFetchingEns,
    isFetched: isFetchedEns,
    isSuccess: isSuccessEns,
  } = useEnsName({ address });

  if (isFetchingEns && !isSuccessEns) {
    return <Button loading></Button>;
  }

  if (isConnected && isFetchedEns) {
    if (!address) throw new Error('Missing address');
    let shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
    return (
      <Button onClick={onClick}>
        <span>{ensName ?? shortAddress}</span>
      </Button>
    );
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

  return <Button onClick={() => connect({ connector: injected(), chainId })}>Connect</Button>;
}
