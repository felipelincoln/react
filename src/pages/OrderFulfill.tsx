import { QueryClient, useQuery } from '@tanstack/react-query';
import {
  ActionButton,
  Button,
  ButtonRed,
  CardNFTSelectable,
  InputDisabledWithLabel,
  Paginator,
  TextBox,
  TextBoxWithNFTs,
  Tootltip,
} from './Components';
import { Order, WithSignature } from '../packages/order/marketplaceProtocol';
import { useContext, useEffect, useState } from 'react';
import {
  CollectionContext,
  UserActivitiesContext,
  UserBalanceContext,
  UserOrdersContext,
  UserTokenIdsContext,
  collectionLoader,
  collectionLoaderData,
} from './App';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { etherToString } from '../packages/utils';
import moment from 'moment';
import { useFulfillOrder } from '../packages/order/useFulfillOrder';
import { useAccount } from 'wagmi';
import { useCancelOrder } from '../packages/order/useCancelOrder';
import NotFoundPage from './NotFound';

interface OrderFulfillLoaderData extends collectionLoaderData {
  tokenId: string;
}

export function OrderFulfillLoader(loaderArgs: LoaderFunctionArgs): OrderFulfillLoaderData {
  const collectionLoaderResult = collectionLoader(loaderArgs);
  const tokenId = loaderArgs.params.tokenId!;

  return { tokenId, ...collectionLoaderResult };
}

// TODO: handle tx revert
// TODO: handle tx replace
// TODO: handle not enough ETH
// TODO: loading skeleton

export function OrderFulfill() {
  const collection = useContext(CollectionContext);
  const { tokenId } = useLoaderData() as OrderFulfillLoaderData;
  const navigate = useNavigate();
  const { address: userAddress, isConnected } = useAccount();
  const [orderTokenIdsSorted, setOrderTokenIdsSorted] = useState<string[]>([]);
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [paginatedTokenIds, setPaginatedTokenIds] = useState<string[]>([]);
  const [tokensPage, setTokensPage] = useState(0);
  const { data: userTokenIds, refetch: refetchUserTokenIds } = useContext(UserTokenIdsContext);
  const { refetch: refetchUserBalance } = useContext(UserBalanceContext);
  const { refetch: refetchUserActivities } = useContext(UserActivitiesContext);
  const {
    data: fulfillOrderTxHash,
    fulfillOrder,
    isSuccess: isFulfillConfirmed,
    isFetching: isFulfillFetching,
    error: fulfillOrderError,
  } = useFulfillOrder();
  const {
    data: cancelOrderTxHash,
    cancelOrder,
    isSuccess: isCancelConfirmed,
    isFetching: isCancelFetching,
    error: cancelOrderError,
  } = useCancelOrder();
  const [pendingCounter, setPendingCounter] = useState(0);

  const {
    data: ordersData,
    isFetched: isOrderFetched,
    isLoading: orderIsLoading,
  } = useQuery<{
    data: { orders: WithSignature<Order>[] };
  }>({
    queryKey: ['order', tokenId],
    refetchInterval: isFulfillConfirmed || isCancelConfirmed ? 1000 : false,
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/${collection.key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection: collection.address, tokenIds: [tokenId] }, null, 2),
      }).then((res) => res.json()),
  });

  const order = ordersData?.data.orders[0];
  const orderTokenIds = order?.fulfillmentCriteria.token.identifier || [];
  const orderTokenAmount = Number(order?.fulfillmentCriteria.token.amount) || 0;
  const orderEndTimeMs = Number(order?.endTime) * 1000;
  const isOrderOwner = order?.offerer === userAddress;
  const canConfirmOrder = selectedTokenIds.length == orderTokenAmount && !isOrderOwner;
  const errorMessage = (fulfillOrderError || cancelOrderError)?.split('\n').slice(0, -1).join('\n');

  useEffect(() => {
    if (isConnected && !userTokenIds) {
      setOrderTokenIdsSorted([]);
      return;
    }
    if (!isOrderFetched) {
      return;
    }
    const orderTokenIdsCopy = [...orderTokenIds];
    orderTokenIdsCopy.sort((a, b) => {
      const aIsUserToken = (userTokenIds || []).includes(a);
      const bIsUserToken = (userTokenIds || []).includes(b);
      if (aIsUserToken && !bIsUserToken) {
        return -1;
      } else if (!aIsUserToken && bIsUserToken) {
        return 1;
      } else {
        return +a - +b;
      }
    });
    setOrderTokenIdsSorted(orderTokenIdsCopy);
  }, [isOrderFetched, userTokenIds, isConnected]);

  useEffect(() => {
    if (isFulfillConfirmed && !order) {
      console.log('purchase confirmed.');
      refetchUserTokenIds();
      refetchUserBalance();
      refetchUserActivities();
      navigate(`/c/${collection.key}`);
    }
  }, [isFulfillConfirmed, order]);

  useEffect(() => {
    if (isFulfillFetching || (isFulfillConfirmed && !!order)) {
      setTimeout(() => setPendingCounter(pendingCounter + 1), 1000);
    }
  }, [isFulfillFetching, isFulfillConfirmed, pendingCounter, order]);

  useEffect(() => {
    if (isCancelFetching || (isCancelConfirmed && !!order)) {
      setTimeout(() => setPendingCounter(pendingCounter + 1), 1000);
    }
  }, [isCancelFetching, isCancelConfirmed, pendingCounter, order]);

  function handleSelectToken(tokenId: string) {
    let tokenIds = [...selectedTokenIds];
    if (tokenIds.includes(tokenId)) {
      tokenIds = tokenIds.filter((id) => id != tokenId);
    } else {
      if (orderTokenAmount == 1) {
        setSelectedTokenIds([tokenId]);
      }
      if (selectedTokenIds.length >= orderTokenAmount) {
        return;
      }
      tokenIds.push(tokenId);
    }
    setSelectedTokenIds(tokenIds);
  }

  function handleConfirm() {
    if (!order) {
      return;
    }

    fulfillOrder({
      selectedTokenIds,
      ...order,
    });
  }

  if (orderIsLoading) {
    return <div className="mx-auto w-fit p-8">Loading...</div>;
  }

  if (!order) {
    return <NotFoundPage></NotFoundPage>;
  }

  return (
    <div className="max-w-screen-lg w-full mx-auto py-8">
      <div className="flex justify-between">
        <h1 className="pb-8">Fulfill order</h1>
        {isOrderOwner && <ButtonRed onClick={() => cancelOrder(order)}>Cancel listing</ButtonRed>}
      </div>
      <div className="flex">
        <div className="flex-grow flex flex-col gap-8">
          <div>
            <span className="flex items-center gap-4 pb-4">
              <span className="text-sm font-medium">Selected items</span>{' '}
              <Tootltip>Selected items will be used to fulfill this order</Tootltip>
            </span>
            <InputDisabledWithLabel value={selectedTokenIds.length} label={`${orderTokenAmount}`} />
          </div>
          <div className="flex flex-wrap gap-4">
            {order &&
              paginatedTokenIds.map((tokenId) => (
                <CardNFTSelectable
                  key={tokenId}
                  tokenId={tokenId}
                  collection={collection}
                  onSelect={() => handleSelectToken(tokenId)}
                  selected={selectedTokenIds.includes(tokenId)}
                  disabled={!userTokenIds?.includes(tokenId)}
                />
              ))}
          </div>
          <Paginator
            items={orderTokenIdsSorted}
            page={tokensPage}
            setItems={setPaginatedTokenIds}
            setPage={setTokensPage}
            itemsPerPage={18}
          />
        </div>
        <div className="w-80 h-fit sticky top-32 flex-shrink-0 bg-zinc-800 p-8 rounded flex flex-col gap-8">
          <div>
            <img className="rounded w-40 h-40 mx-auto" src={`/${collection.key}/${tokenId}.png`} />
            <div className="text-center leading-8">{`${collection.name} #${tokenId}`}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>You pay</div>
            {order?.fulfillmentCriteria.coin?.amount && (
              <TextBox>{`${etherToString(
                BigInt(order?.fulfillmentCriteria.coin?.amount),
                false,
              )}`}</TextBox>
            )}
            <TextBoxWithNFTs
              value={`${order?.fulfillmentCriteria.token.amount} ${collection.symbol}`}
              collection={collection}
              tokenIds={selectedTokenIds}
            />
          </div>
          <div className="flex flex-col gap-4">
            <div>Order expires</div>
            <TextBox>{moment(orderEndTimeMs).fromNow()}</TextBox>
          </div>
          {pendingCounter == 0 && (
            <div className="flex items-center">
              <ActionButton disabled={!canConfirmOrder} onClick={() => handleConfirm()}>
                Confirm
              </ActionButton>
              <a className="default mx-8" onClick={() => navigate(`/c/${collection.key}`)}>
                Cancel
              </a>
            </div>
          )}
          {pendingCounter > 0 && (
            <div className="overflow-hidden text-ellipsis">
              Transaction is pending ({pendingCounter}s){' '}
              {fulfillOrderTxHash && (
                <a target="_blank" href={`https://sepolia.etherscan.io/tx/${fulfillOrderTxHash}`}>
                  {fulfillOrderTxHash}
                </a>
              )}
              {cancelOrderTxHash && (
                <a target="_blank" href={`https://sepolia.etherscan.io/tx/${cancelOrderTxHash}`}>
                  {cancelOrderTxHash}
                </a>
              )}
            </div>
          )}
          {!!errorMessage && (
            <div className="overflow-hidden text-ellipsis red">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}
