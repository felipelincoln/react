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
  useChainId,
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
  ButtonAccordion,
  CardNFTSelectable,
  Dialog,
  ExternalLink,
  IconNFT,
  IconNFTLarge,
  ItemETH,
  ItemNFT,
  ListedNFT,
  PriceTag,
} from './Components';
import { EthereumNetwork, config } from '../config';
import { etherToString, shortAddress } from '../packages/utils';
import moment from 'moment';
import { useCancelAllOrders } from '../packages/order/useCancelAllOrders';

export const CollectionContext = createContext<CollectionDetails>(defaultCollection);
export const UserAddressContext = createContext<{ data: string | undefined; disconnect: Function }>(
  { data: undefined, disconnect: () => {} },
);
export const UserENSContext = createContext<{ data: string | undefined }>({ data: undefined });
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
    chains: [sepolia],
    connectors: [injected()],
    transports: {
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
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });
  const chainId = useChainId();
  const [userBalance, setUserBalance] = useState<string | undefined>(undefined);
  const [userTokenIds, setUserTokenIds] = useState<string[] | undefined>(undefined);
  const [userOrders, setUserOrders] = useState<WithSignature<Order>[] | undefined>(undefined);
  const [userActivities, setUserActivities] = useState<With_Id<Activity>[] | undefined>(undefined);
  const [userAddress, setUserAddress] = useState<`0x${string}` | undefined>(undefined);
  const [userEns, setUserEns] = useState<string | undefined>(undefined);
  const [showAccountTab, setShowAccountTab] = useState(false);
  const [showActivityTab, setShowActivityTab] = useState(false);

  const { data: userBalanceData, refetch: userBalanceRefetch } = useBalance({
    address: userAddress,
  });

  const { data: userTokenIdsData, refetch: userTokenIdsRefetch } = useQuery<{
    data?: { tokens: string[] };
    error?: string;
  }>({
    enabled: !!userAddress && !!collection,
    queryKey: ['eth_tokens_user', userAddress],
    queryFn: () =>
      fetch(`http://localhost:3000/eth/tokens/${collection?.key}/${userAddress}`).then((res) =>
        res.json(),
      ),
  });

  const { data: userOrdersData, refetch: userOrdersRefetch } = useQuery<{
    data: { orders: WithSignature<Order>[] };
    error?: string;
  }>({
    queryKey: ['orders_list_user', userAddress, userTokenIds?.join('-')],
    enabled: !!collection && !!userAddress && !!userTokenIds && userTokenIds.length > 0,
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/${collection?.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenIds: userTokenIds, offerer: userAddress }, null, 2),
      }).then((res) => res.json()),
  });

  const { data: userActivitiesData, refetch: userActivitiesRefetch } = useQuery<{
    data: { activities: With_Id<Activity>[] };
    error?: string;
  }>({
    queryKey: ['activities_list_user', userAddress],
    enabled: !!collection && !!userAddress,
    queryFn: () =>
      fetch(`http://localhost:3000/activities/list/${collection?.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: userAddress }, null, 2),
      }).then((res) => res.json()),
  });

  useEffect(() => {
    if (!address || address == userAddress) return;
    console.log('-> updating user address', address);
    setUserAddress(address);
  }, [address]);

  useEffect(() => {
    if (!userBalanceData) return;
    console.log('-> updating user balance', userBalanceData?.value.toString());
    setUserBalance(userBalanceData?.value.toString());
  }, [userBalanceData]);

  useEffect(() => {
    if (!userTokenIdsData) return;
    console.log('-> updating user token ids', userTokenIdsData?.data?.tokens);
    setUserTokenIds(userTokenIdsData?.data?.tokens);
  }, [userTokenIdsData]);

  useEffect(() => {
    if (!userOrdersData) return;
    console.log('-> updating user orders', userOrdersData?.data?.orders);
    setUserOrders(userOrdersData?.data?.orders);
  }, [userOrdersData]);

  useEffect(() => {
    if (!userActivitiesData) return;
    console.log('-> updating user activities', userActivitiesData?.data?.activities);
    setUserActivities(userActivitiesData?.data?.activities);
  }, [userActivitiesData]);

  useEffect(() => {
    if (!userAddress) {
      setShowAccountTab(false);
      setShowActivityTab(false);
    }
  }, [userAddress]);

  useEffect(() => {
    if (!ensName) return;
    console.log('-> updating user ens', ensName);
    setUserEns(ensName);
  }, [ensName]);

  function disconnectUser() {
    disconnect();
    setUserAddress(undefined);
    setUserEns(undefined);
    setUserTokenIds(undefined);
    setUserBalance(undefined);
    setUserOrders(undefined);
    setUserActivities(undefined);
  }

  if (!collection) {
    return <NotFoundPage></NotFoundPage>;
  }

  return (
    <CollectionContext.Provider value={collection}>
      <UserTokenIdsContext.Provider value={{ data: userTokenIds, refetch: userTokenIdsRefetch }}>
        <UserBalanceContext.Provider value={{ data: userBalance, refetch: userBalanceRefetch }}>
          <UserOrdersContext.Provider value={{ data: userOrders, refetch: userOrdersRefetch }}>
            <UserAddressContext.Provider value={{ data: userAddress, disconnect: disconnectUser }}>
              <UserENSContext.Provider value={{ data: userEns }}>
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
              </UserENSContext.Provider>
            </UserAddressContext.Provider>
          </UserOrdersContext.Provider>
        </UserBalanceContext.Provider>
      </UserTokenIdsContext.Provider>
    </CollectionContext.Provider>
  );
}

function AccountTab({ showTab, setShowTab }: { showTab: boolean; setShowTab: Function }) {
  const collection = useContext(CollectionContext);
  const { data: address, disconnect } = useContext(UserAddressContext);
  const { data: ensName } = useContext(UserENSContext);
  const navigate = useNavigate();
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>();
  const [lastSelectedTokenId, setLastSelectedTokenId] = useState<string | undefined>();
  const [pendingCounter, setPendingCounter] = useState(0);
  const { data: userTokenIdsData } = useContext(UserTokenIdsContext);
  const { data: userOrdersData, refetch: refetchUserOrders } = useContext(UserOrdersContext);
  const {
    data: cancelAllOrdersHash,
    cancelAllOrders,
    isSuccess: isCancelAllOrdersConfirmed,
    isFetching: isCancelAllOrdersFetching,
  } = useCancelAllOrders();

  const displayListButton = !!selectedTokenId ? '' : 'translate-y-16';
  const userTokenIds = userTokenIdsData || [];
  const userOrders = userOrdersData || [];

  useEffect(() => {
    if (isCancelAllOrdersConfirmed && userOrders.length === 0) {
      setPendingCounter(0);
    }

    if (isCancelAllOrdersFetching || (isCancelAllOrdersConfirmed && userOrders.length > 0)) {
      if (isCancelAllOrdersConfirmed) refetchUserOrders();
      setTimeout(() => setPendingCounter(pendingCounter + 1), 1000);
    }
  }, [isCancelAllOrdersFetching, isCancelAllOrdersConfirmed, pendingCounter, userOrders.length]);

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
    <>
      <Dialog open={pendingCounter > 0} title="Cancel all orders">
        <div className="overflow-hidden text-ellipsis">
          Transaction is pending ({pendingCounter}s){' '}
          {cancelAllOrdersHash && (
            <a target="_blank" href={`https://sepolia.etherscan.io/tx/${cancelAllOrdersHash}`}>
              {cancelAllOrdersHash}
            </a>
          )}
        </div>
      </Dialog>
      <Tab hidden={!showTab}>
        <div className="mt-24 flex-grow overflow-y-auto overflow-x-hidden">
          <div className="p-8 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <div className="overflow-x-hidden text-ellipsis font-medium">
                {!!ensName ? <span>{ensName}</span> : <span className="text-sm">{address}</span>}
              </div>
              <div className="flex flex-col gap-2 text-sm text-zinc-400 cursor-pointer">
                <div className="hover:text-zinc-200" onClick={() => disconnect()}>
                  Disconnect
                </div>
                {userOrders.length > 1 && (
                  <div className="hover:text-zinc-200" onClick={cancelAllOrders}>
                    Cancel all orders ({userOrders.length})
                  </div>
                )}
              </div>
            </div>
            {userOrders.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="text-sm text-zinc-400">Listed ({userOrders.length})</div>
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
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="text-sm text-zinc-400">Unlisted ({userUnlistedTokenIds.length})</div>
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
          <Button disabled>{`${collection.name} #${
            selectedTokenId || lastSelectedTokenId
          }`}</Button>
          <ActionButton onClick={handleClickListItem}>List Item</ActionButton>
        </div>
      </Tab>
    </>
  );
}

function ActivityTab({ showTab }: { showTab: boolean }) {
  const collection = useContext(CollectionContext);
  const [userNotificationsCache, setuserNotificationsCache] = useState(0);
  const { data: address } = useContext(UserAddressContext);
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
    enabled: !!address && userNotifications.length > 0 && showTab,
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
                    <tr
                      key={activity.txHash}
                      className="border-b-2 border-zinc-800 *:py-4 last:border-0"
                    >
                      <td className="align-top">
                        <div className="flex flex-col gap-4 text-xs text-zinc-400">
                          <div className="relative">
                            {isNew && (
                              <div className="absolute bottom-1 -left-5 h-2 w-2 rounded-full bg-cyan-400"></div>
                            )}
                            <span className={isNew ? 'font-medium text-zinc-200' : ''}>
                              {' '}
                              Item {isOfferer ? 'sold' : 'bought'}
                            </span>
                          </div>
                          <ItemNFT collection={collection} tokenId={activity.tokenId}></ItemNFT>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col gap-4">
                          <ExternalLink href={`https://sepolia.etherscan.io/tx/${activity.txHash}`}>
                            {moment(Number(activity.createdAt)).fromNow()}
                          </ExternalLink>
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
                        </div>
                      </td>
                    </tr>
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
  const display = hidden ? 'translate-x-96' : 'z-10';
  const containerZIndex = hidden ? '-z-20' : '';

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
  const { data: userAddress } = useContext(UserAddressContext);
  const { data: userNotificationsData } = useQuery<{
    data: { notifications: With_Id<Notification>[] };
  }>({
    queryKey: ['notifications_list_user'],
    enabled: !!userAddress,
    refetchInterval: 12_000,
    queryFn: () =>
      fetch(`http://localhost:3000/notifications/list/${collection.key}/${userAddress}`).then(
        (res) => res.json(),
      ),
  });

  const userNotifications = userNotificationsData?.data.notifications || [];

  let buttons = [<UserButton key="1" onClick={onClickAccount} />];
  if (!!userAddress) {
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
    <div className="fixed top-0 z-20 w-full bg-zinc-900">
      <div className="h-24 flex px-8 border-b-2 border-zinc-800">
        <div className="my-4 h-16 w-16 bg-zinc-800 rounded"></div>
        <div className="flex h-8 my-8 flex-grow justify-end gap-4">{buttons}</div>
      </div>
    </div>
  );
}

function UserButton({ onClick }: { onClick: Function }) {
  const { connect } = useConnect();
  const { data: address } = useContext(UserAddressContext);
  const { data: ensName } = useContext(UserENSContext);

  if (!!ensName) {
    return (
      <Button onClick={onClick}>
        <span>{ensName}</span>
      </Button>
    );
  }

  if (!!address) {
    return (
      <Button onClick={onClick}>
        <span>{shortAddress(address)}</span>
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
