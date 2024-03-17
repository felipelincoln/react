import { UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  ActionButton,
  CardNFTSelectable,
  InputDisabledWithLabel,
  Paginator,
  Skeleton,
  TextBox,
  TextBoxWithNFTs,
  Tootltip,
} from './Components';
import { Order, WithSelectedTokenIds, WithSignature } from '../packages/order/marketplaceProtocol';
import { useContext, useEffect, useState } from 'react';
import {
  CollectionContext,
  UserTokenIdsContext,
  collectionLoader,
  collectionLoaderData,
} from './App';
import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { etherToString } from '../packages/utils';
import moment from 'moment';
import { useFulfillOrder } from '../packages/order/useFulfillOrder';
import { useQueryUserTokenIds } from '../hooks/useQueryUserTokenIds';

interface OrderFulfillLoaderData extends collectionLoaderData {
  tokenId: string;
}

export function OrderFulfillLoader(loaderArgs: LoaderFunctionArgs): OrderFulfillLoaderData {
  const collectionLoaderResult = collectionLoader(loaderArgs);
  const tokenId = loaderArgs.params.tokenId!;

  return { tokenId, ...collectionLoaderResult };
}

export function OrderFulfill() {
  const collection = useContext(CollectionContext);
  const { tokenId } = useLoaderData() as OrderFulfillLoaderData;
  const navigate = useNavigate();
  const [orderTokenIdsSorted, setOrderTokenIdsSorted] = useState<string[]>([]);
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [paginatedTokenIds, setPaginatedTokenIds] = useState<string[]>([]);
  const [tokensPage, setTokensPage] = useState(0);
  const { data: userTokenIdsResult, isFetched: isUserTokenIdsFetched } = useQueryUserTokenIds({
    collection,
  });
  const { fulfillOrder, isFulfillConfirmed, error } = useFulfillOrder();

  const { data: ordersResult, isFetched: isOrderFetched } = useQuery<{
    data: { orders: WithSignature<Order>[] };
  }>({
    queryKey: ['order', tokenId],
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection: collection.address, tokenIds: [tokenId] }, null, 2),
      }).then((res) => res.json()),
  });

  console.log({ isFulfillConfirmed, error });

  const order = ordersResult?.data.orders[0];
  const orderTokenIds = order?.fulfillmentCriteria.token.identifier || [];
  const orderTokenAmount = Number(order?.fulfillmentCriteria.token.amount) || 0;
  const orderEndTimeMs = Number(order?.endTime) * 1000;
  const canConfirmOrder = selectedTokenIds.length == orderTokenAmount;
  let userTokenIds = userTokenIdsResult || [];

  useEffect(() => {
    if (!isOrderFetched || !isUserTokenIdsFetched) {
      return;
    }
    const orderTokenIdsCopy = [...orderTokenIds];
    orderTokenIdsCopy.sort((a, b) => {
      const aIsUserToken = userTokenIds.includes(a);
      const bIsUserToken = userTokenIds.includes(b);
      if (aIsUserToken && !bIsUserToken) {
        return -1;
      } else if (!aIsUserToken && bIsUserToken) {
        return 1;
      } else {
        return +a - +b;
      }
    });
    setOrderTokenIdsSorted(orderTokenIdsCopy);
  }, [isOrderFetched, isUserTokenIdsFetched]);

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

  return (
    <div className="max-w-screen-lg w-full mx-auto pt-8">
      <h1 className="pb-8">Fulfill order</h1>
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
                  disabled={!userTokenIds.includes(tokenId)}
                />
              ))}
          </div>
          <Paginator
            items={orderTokenIdsSorted}
            page={tokensPage}
            setItems={setPaginatedTokenIds}
            setPage={setTokensPage}
            itemsPerPage={50}
          />
        </div>
        <div className="w-80 flex-shrink-0 bg-zinc-800 p-8 rounded flex flex-col gap-8">
          <div>
            <img className="rounded w-40 h-40 mx-auto" src={`/${collection.key}/${tokenId}.png`} />
            <div className="text-center leading-8">{`${collection.name} #${tokenId}`}</div>
          </div>
          <div className="flex flex-col gap-4">
            <div>You pay</div>
            {order?.fulfillmentCriteria.coin?.amount && (
              <TextBox mono>{`${etherToString(
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
          <div className="flex items-center">
            <ActionButton disabled={!canConfirmOrder} onClick={() => handleConfirm()}>
              Confirm
            </ActionButton>
            <a className="default mx-8" onClick={() => navigate(`/c/${collection.key}`)}>
              Cancel
            </a>
          </div>
          <div className="red text-xs">{error}</div>
        </div>
      </div>
    </div>
  );
}
