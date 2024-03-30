import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import {
  CollectionDetails,
  defaultCollection,
  supportedCollections,
} from '../collection/collections';
import NotFoundPage from './NotFound';
import { ReactElement, createContext, useContext, useEffect, useState } from 'react';
import {
  WagmiProvider,
  createConfig,
  fallback,
  http,
  unstable_connector,
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useEnsAddress,
  useEnsName,
  useFeeData,
} from 'wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { QueryClient, QueryClientProvider, UseQueryResult, useQuery } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';
import {
  Activity,
  Notification,
  Order,
  WithSignature,
  With_Id,
} from '../packages/order/marketplaceProtocol';
import {
  ActionButton,
  ActivityButton,
  Button,
  CardNFTSelectable,
  ExternalLink,
  IconNFT,
  IconNFTLarge,
  ItemETH,
  ItemNFT,
  ListedNFT,
  PriceTag,
} from './Components';
import { EthereumNetwork, config } from '../config';
import { etherToString } from '../packages/utils';
import moment from 'moment';

export const CollectionContext = createContext<CollectionDetails>(defaultCollection);
export const UserTokenIdsContext = createContext<{ data: string[] | undefined; refetch: Function }>(
  { data: undefined, refetch: () => {} },
);
export const UserBalanceContext = createContext<{ data: string | undefined; refetch: Function }>({
  data: undefined,
  refetch: () => {},
});
export const UserOrdersContext = createContext<{
  data: WithSignature<Order>[] | undefined;
  refetch: Function;
}>({
  data: undefined,
  refetch: () => {},
});
export const UserActivitiesContext = createContext<{
  data: With_Id<Activity>[] | undefined;
  refetch: Function;
}>({
  data: undefined,
  refetch: () => {},
});

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
      [mainnet.id]: fallback([unstable_connector(injected), http('http://localhost:3000/jsonrpc')]),
      [sepolia.id]: fallback([unstable_connector(injected), http('http://localhost:3000/jsonrpc')]),
    },
  });

  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
      <QueryClientProvider client={queryClient}>
        <AppContextProvider>{children}</AppContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function AppContextProvider({ children }: { children: ReactElement[] | ReactElement }) {
  const { collection } = useLoaderData() as collectionLoaderData;
  const { address: userAddress, isConnected, isConnecting } = useAccount();
  const [userBalance, setUserBalance] = useState<string | undefined>(undefined);
  const [userTokenIds, setUserTokenIds] = useState<string[] | undefined>(undefined);
  const [userOrders, setUserOrders] = useState<WithSignature<Order>[] | undefined>(undefined);
  const [userActivities, setUserActivities] = useState<With_Id<Activity>[] | undefined>(undefined);
  const [showAccountTab, setShowAccountTab] = useState(false);
  const [showActivityTab, setShowActivityTab] = useState(false);
  const {
    data: userBalanceData,
    refetch: userBalanceRefetch,
    isFetched: userBalanceIsFetched,
    isFetching: userBalanceIsFetching,
  } = useBalance({
    address: userAddress,
    query: { staleTime: Infinity },
  });
  const {
    data: userTokenIdsData,
    refetch: userTokenIdsRefetch,
    isFetched: userTokenIdsDataIsFetched,
    isFetching: userTokenIdsDataIsFetching,
  } = useQuery<{
    data?: { tokens: string[] };
    error?: string;
  }>({
    enabled: !!collection && !!userAddress,
    queryKey: ['eth_tokens_user'],
    staleTime: Infinity,
    queryFn: () =>
      fetch(`http://localhost:3000/eth/tokens/${collection?.key}/${userAddress}`).then((res) =>
        res.json(),
      ),
  });
  const {
    data: userOrdersData,
    refetch: userOrdersRefetch,
    isFetched: userOrdersIsFetched,
    isFetching: userOrdersIsFetching,
  } = useQuery<{
    data: { orders: WithSignature<Order>[] };
    error?: string;
  }>({
    queryKey: ['orders_list_user', userTokenIds?.join('-')],
    staleTime: Infinity,
    enabled: !!collection && !!userAddress && (userTokenIds || []).length > 0,
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/${collection?.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenIds: userTokenIds }, null, 2),
      }).then((res) => res.json()),
  });

  const {
    data: userActivitiesData,
    refetch: userActivitiesRefetch,
    isFetched: userActivitiesIsFetched,
    isFetching: userActivitiesIsFetching,
  } = useQuery<{ data: { activities: With_Id<Activity>[] }; error?: string }>({
    queryKey: ['activities_list_user'],
    staleTime: Infinity,
    enabled: !!collection && !!userAddress,
    queryFn: () =>
      fetch(`http://localhost:3000/activities/list/${collection?.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress }, null, 2),
      }).then((res) => res.json()),
  });

  useEffect(() => {
    if (!userBalanceIsFetching && userBalanceIsFetched) {
      console.log('updating user balance');
      setUserBalance(userBalanceData?.value.toString());
    }
  }, [userBalanceIsFetching]);

  useEffect(() => {
    if (!userTokenIdsDataIsFetching && userTokenIdsDataIsFetched) {
      console.log('updating user token ids');
      setUserTokenIds(userTokenIdsData?.data?.tokens);
    }
  }, [userTokenIdsDataIsFetching]);

  useEffect(() => {
    if (!userOrdersIsFetching && userOrdersIsFetched) {
      console.log('updating user orders');
      setUserOrders(userOrdersData?.data?.orders);
    }
  }, [userOrdersIsFetching]);

  useEffect(() => {
    if (!userActivitiesIsFetching && userActivitiesIsFetched) {
      console.log('updating user activities');
      setUserActivities(userActivitiesData?.data?.activities);
    }
  }, [userActivitiesIsFetching]);

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      setShowAccountTab(false);
      setShowActivityTab(false);
    }
  }, [isConnected, isConnecting]);

  if (!collection) {
    return <NotFoundPage></NotFoundPage>;
  }

  return (
    <CollectionContext.Provider value={collection}>
      <UserTokenIdsContext.Provider value={{ data: userTokenIds, refetch: userTokenIdsRefetch }}>
        <UserBalanceContext.Provider value={{ data: userBalance, refetch: userBalanceRefetch }}>
          <UserOrdersContext.Provider value={{ data: userOrders, refetch: userOrdersRefetch }}>
            <UserActivitiesContext.Provider
              value={{ data: userActivities, refetch: userActivitiesRefetch }}
            >
              <Navbar
                onClickAccount={() => {
                  setShowAccountTab(!showAccountTab);
                  setShowActivityTab(false);
                }}
                onClickActivity={() => {
                  setShowActivityTab(!showActivityTab);
                  setShowAccountTab(false);
                }}
              />
              <AccountTab showTab={showAccountTab} setShowTab={setShowAccountTab} />
              <ActivityTab showTab={showActivityTab} />
              {children}
            </UserActivitiesContext.Provider>
          </UserOrdersContext.Provider>
        </UserBalanceContext.Provider>
      </UserTokenIdsContext.Provider>
    </CollectionContext.Provider>
  );
}

function AccountTab({ showTab, setShowTab }: { showTab: boolean; setShowTab: Function }) {
  const collection = useContext(CollectionContext);
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>();
  const [lastSelectedTokenId, setLastSelectedTokenId] = useState<string | undefined>();
  const { data: userTokenIdsData } = useContext(UserTokenIdsContext);
  const { data: userOrdersData } = useContext(UserOrdersContext);

  const displayListButton = !!selectedTokenId ? '' : 'translate-y-16';
  const userTokenIds = userTokenIdsData || [];
  const userOrders = userOrdersData || [];

  useEffect(() => {
    if (selectedTokenId) {
      setLastSelectedTokenId(selectedTokenId);
    }
  }, [selectedTokenId]);

  function handleSelectToken(tokenId: string) {
    if (selectedTokenId === tokenId) {
      setSelectedTokenId(undefined);
      return;
    }
    setSelectedTokenId(tokenId);
  }

  function handleClickListItem() {
    setShowTab(false);
    setSelectedTokenId(undefined);
    navigate(`/c/${collection.key}/order/create/${selectedTokenId}`);
  }

  function handleClickListedItem(tokenId: string) {
    setShowTab(false);
    setSelectedTokenId(undefined);
    navigate(`/c/${collection.key}/order/fulfill/${tokenId}`);
  }

  const userUnlistedTokenIds = userTokenIds.filter(
    (tokenId) => !userOrders.find((order) => order.tokenId === tokenId),
  );

  return (
    <Tab hidden={!showTab}>
      <div className="mt-24 flex-grow overflow-y-auto overflow-x-hidden">
        <div className="p-8 flex flex-col gap-8">
          <div className="overflow-x-hidden text-ellipsis font-medium">
            <span className="text-sm">{address}</span>
          </div>
          {userOrders.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="text-sm text-zinc-400">Listed</div>
              <div className="flex flex-col flex-wrap gap-4">
                {userOrders.map(({ tokenId, fulfillmentCriteria }) => (
                  <ListedNFT
                    tokenId={tokenId}
                    collection={collection}
                    key={tokenId}
                    tokenPrice={fulfillmentCriteria.token.amount}
                    ethPrice={fulfillmentCriteria.coin?.amount}
                    onClick={() => handleClickListedItem(tokenId)}
                  />
                ))}
                <Button>Cancel all listings</Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="text-sm text-zinc-400">Unlisted</div>
            <div className="grid grid-cols-3 gap-4">
              {userUnlistedTokenIds.map((tokenId) => (
                <CardNFTSelectable
                  key={tokenId}
                  collection={collection}
                  selected={selectedTokenId === tokenId}
                  onSelect={() => handleSelectToken(tokenId)}
                  tokenId={tokenId}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div>{selectedTokenId && <div className="h-16"></div>}</div>
      <div
        className={`fixed bottom-0 right-0 px-8 py-4 w-96 bg-zinc-800 flex gap-4 transition ease-in-out delay-0 ${displayListButton}`}
      >
        <Button disabled>{`${collection.name} #${selectedTokenId || lastSelectedTokenId}`}</Button>
        <ActionButton onClick={handleClickListItem}>List Item</ActionButton>
      </div>
    </Tab>
  );
}

function ActivityTab({ showTab }: { showTab: boolean }) {
  const collection = useContext(CollectionContext);
  const [userNotificationsCache, setuserNotificationsCache] = useState(0);
  const { address, isConnected } = useAccount();
  const { refetch: refetchUserTokenIds } = useContext(UserTokenIdsContext);
  const { refetch: refetchUserBalance } = useContext(UserBalanceContext);
  const { refetch: refetchUserActivities, data: userActivitiesData } =
    useContext(UserActivitiesContext);
  const {
    data: userNotificationsData,
    isFetching: userNotificationsIsFetching,
    isFetched: userNotificationsIsFetched,
  } = useQuery<{
    data: { notifications: With_Id<Notification>[] };
  }>({
    queryKey: ['notifications_list_user'],
    enabled: !!address,
    queryFn: () =>
      fetch(`http://localhost:3000/notifications/list/${collection.key}/${address}`).then((res) =>
        res.json(),
      ),
  });
  const userNotifications = userNotificationsData?.data.notifications || [];

  useEffect(() => {
    if (!userNotificationsIsFetching && userNotificationsIsFetched) {
      setuserNotificationsCache(userNotifications.length);
    }
  }, [userNotificationsIsFetching]);

  useEffect(() => {
    if (userNotificationsCache > 0) {
      console.log('new notification');
      refetchUserTokenIds();
      refetchUserBalance();
      refetchUserActivities();
    }
  }, [userNotificationsCache]);

  // TODO: view notifications when user closes activity tab
  useQuery<{ data: { activities: With_Id<Activity>[] } }>({
    queryKey: ['user_view_notifications'],
    enabled: isConnected && userNotifications.length > 0 && showTab,
    queryFn: () =>
      fetch('http://localhost:3000/notifications/view/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: userNotifications.map((n) => n._id) }, null, 2),
      }).then((res) => res.json()),
  });

  const userActivities = userActivitiesData || [];

  return (
    <Tab hidden={!showTab}>
      <div className="mt-24 flex-grow overflow-y-auto overflow-x-hidden">
        <div className="p-8 flex flex-col gap-4">
          <div className="font-medium text-lg">Activity</div>
          {userActivities.length > 0 && (
            <table>
              <tbody>
                {userActivities.map((activity) => {
                  const isOfferer = activity.offerer === address;
                  const isNew = userNotifications.find(
                    (notification) => notification.activityId == activity._id,
                  );

                  return (
                    <>
                      <tr>
                        <td className="text-sm text-zinc-400 pt-4 align-baseline">
                          <div className="relative">
                            {isNew && (
                              <div className="absolute bottom-1 -left-5 h-2 w-2 rounded-full bg-cyan-400"></div>
                            )}
                            <span className={isNew ? 'font-medium text-zinc-200' : ''}>
                              {' '}
                              Item {isOfferer ? 'sold' : 'bought'}
                            </span>
                          </div>
                        </td>
                        <td className="text-xs text-zinc-400 pt-4 align-baseline">
                          <ExternalLink href={`https://sepolia.etherscan.io/tx/${activity.txHash}`}>
                            {moment(Number(activity.createdAt)).fromNow()}
                          </ExternalLink>
                        </td>
                      </tr>
                      <tr
                        key={activity.txHash}
                        className="border-b-2 border-zinc-800 *:py-4 last:border-0"
                      >
                        <td className="align-top">
                          <ItemNFT collection={collection} tokenId={activity.tokenId}></ItemNFT>
                        </td>
                        <td>
                          <div className="flex flex-col gap-2">
                            {activity.fulfillment.coin && (
                              <ItemETH value={activity.fulfillment.coin.amount} />
                            )}
                            {activity.fulfillment.token.identifier.map((tokenId) => (
                              <ItemNFT
                                key={activity.txHash.concat(tokenId)}
                                collection={collection}
                                tokenId={tokenId}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Tab>
  );
}

function Tab({ hidden, children }: { hidden: boolean; children: ReactElement | ReactElement[] }) {
  const display = hidden ? 'translate-x-96' : 'z-40';
  const containerZIndex = hidden ? '-z-50' : '';

  return (
    <div className={`absolute right-0 top-0 w-96 h-screen ${containerZIndex}`}>
      <div
        className={`fixed flex flex-col h-full w-96 box-content border-l-2 border-zinc-800 bg-zinc-900 transition ease-in-out delay-0 ${display}`}
      >
        {children}
      </div>
    </div>
  );
}

function Navbar({
  onClickAccount,
  onClickActivity,
}: {
  onClickAccount: Function;
  onClickActivity: Function;
}) {
  const collection = useContext(CollectionContext);
  const { data: userTokenIds } = useContext(UserTokenIdsContext);
  const { data: userBalance } = useContext(UserBalanceContext);
  const { isConnected, address } = useAccount();
  const { data: userNotificationsData } = useQuery<{
    data: { notifications: With_Id<Notification>[] };
  }>({
    queryKey: ['notifications_list_user'],
    enabled: !!address,
    refetchInterval: 12_000,
    queryFn: () =>
      fetch(`http://localhost:3000/notifications/list/${collection.key}/${address}`).then((res) =>
        res.json(),
      ),
  });

  const userNotifications = userNotificationsData?.data.notifications || [];

  let buttons = [<UserButton key="1" onClick={onClickAccount} />];
  if (isConnected) {
    let userTokens = `${userTokenIds?.length} ${collection.symbol}`;
    let userEth = etherToString(BigInt(userBalance || '0'));

    buttons = [
      <Button key="2" disabled loading={!userTokenIds}>
        <span>{userTokens}</span>
      </Button>,
      <Button key="3" disabled loading={!userBalance}>
        <span>{userEth}</span>
      </Button>,
      <ActivityButton
        key="4"
        count={userNotifications.length}
        onClick={onClickActivity}
      ></ActivityButton>,
      ...buttons,
    ];
  }

  return (
    <div className="fixed top-0 z-50 w-full bg-zinc-900">
      <div className="h-24 flex px-8 border-b-2 border-zinc-800">
        <div className="my-4 h-16 w-16 bg-zinc-800 rounded"></div>
        <div className="flex h-8 my-8 flex-grow justify-end gap-4">{buttons}</div>
      </div>
    </div>
  );
}

function UserButton({ onClick }: { onClick: Function }) {
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();

  if (isConnected) {
    if (!address) throw new Error('Missing address');
    let shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
    return (
      <Button onClick={onClick}>
        <span>{shortAddress}</span>
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
