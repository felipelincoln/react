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
  http,
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
import { formatEther } from 'viem';
import { etherToString } from '../packages/utils';
import { useQueryUserTokenIds } from '../hooks/useQueryUserTokenIds';
import { ItemCard } from './CollectionPage/CollectionItems/ItemCard';
import { SelectableItemCard } from './CollectionPage/CollectionItems/SelectableItemCard';
import moment from 'moment';

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
  const { address: userAddress, isConnected, isConnecting } = useAccount();
  const [showAccountTab, setShowAccountTab] = useState(false);
  const [showActivityTab, setShowActivityTab] = useState(false);

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      setShowAccountTab(false);
      setShowActivityTab(false);
    }
  }, [isConnected, isConnecting]);

  if (!collection) {
    return <NotFoundPage></NotFoundPage>;
  }

  const { data: userTokenIdsResult } = useQuery<{ data: { tokens: string[] } }>({
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
          <ActivityTab showTab={true} />
          {children}
        </UserNotificationsContext.Provider>
      </UserTokenIdsContext.Provider>
    </CollectionContext.Provider>
  );
}

function AccountTab({ showTab, setShowTab }: { showTab: boolean; setShowTab: Function }) {
  const collection = useContext(CollectionContext);
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const navigate = useNavigate();
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>();
  const [lastSelectedTokenId, setLastSelectedTokenId] = useState<string | undefined>();

  const { data: userTokenIdsResult } = useQuery<{ data: { tokens: string[] } }>({
    queryKey: ['user_token_ids'],
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection.key}/${address}`).then((res) => res.json()),
    enabled: isConnected,
  });

  const userTokenIds = userTokenIdsResult?.data.tokens || [];
  const displayListButton = !!selectedTokenId ? '' : 'translate-y-16';

  const { data: ordersResult } = useQuery<{
    data: { orders: WithSignature<Order>[] };
  }>({
    queryKey: ['user-order'],
    enabled: userTokenIds.length > 0,
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection: collection.address, tokenIds: userTokenIds }, null, 2),
      }).then((res) => res.json()),
  });

  const userOrders = ordersResult?.data.orders || [];

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
            {ensName ? (
              <span className="text-lg">{ensName}</span>
            ) : (
              <span className="text-sm">{address}</span>
            )}
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
  const { address, isConnected } = useAccount();

  const { data: userActivitiesResult } = useQuery<{ data: { activities: Activity[] } }>({
    queryKey: ['user_activities'],
    enabled: isConnected,
    queryFn: () =>
      fetch('http://localhost:3000/activity/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection: collection.address, address }, null, 2),
      }).then((res) => res.json()),
  });

  const userActivities = userActivitiesResult?.data.activities || [];

  return (
    <Tab hidden={!showTab}>
      <div className="mt-24 flex-grow overflow-y-auto overflow-x-hidden">
        <div className="p-8 flex flex-col gap-8">
          <div className="font-medium text-lg">Activity</div>
          {userActivities.length > 0 && (
            <table>
              <thead>
                <tr className="*:font-normal text-sm text-zinc-400 text-left">
                  <th>Item</th>
                  <th>Received</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {userActivities.map((activity) => (
                  <tr
                    key={activity.txHash}
                    className="border-b-2 border-zinc-800 *:py-4 last:border-0"
                  >
                    <td className="align-top">
                      <div className="relative">
                        <div className="absolute top-0 -left-4 h-1 w-1 bg-cyan-400"></div>
                        <ItemNFT collection={collection} tokenId={activity.tokenId}></ItemNFT>
                      </div>
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
                    <td className="text-xs text-zinc-400 align-top max-w-12">
                      <ExternalLink href={`https://sepolia.etherscan.io/tx/${activity.txHash}`}>
                        {moment(Number(activity.createdAt)).fromNow()}
                      </ExternalLink>
                    </td>
                  </tr>
                ))}
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

  return (
    <div className="absolute right-0 top-0 w-96 h-screen">
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
  const { data: userTokenIdsResult, isFetching: isUserTokenIdsFetching } = useQueryUserTokenIds({
    collection,
  });
  const userNotifications = useContext(UserNotificationsContext);
  const { isConnected, address } = useAccount();
  const { data: balance, isLoading: isLoadingBalance } = useBalance({ address });

  const userTokenIds = userTokenIdsResult || [];
  console.log({ userTokenIds });

  let buttons = [<UserButton key="1" onClick={onClickAccount} />];
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
