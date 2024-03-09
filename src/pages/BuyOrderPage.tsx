import { LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import {
  CollectionContext,
  UserTokenIdsContext,
  collectionLoader,
  collectionLoaderData,
} from './App';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { Order, WithSelectedTokenIds, WithSignature } from '../packages/order/marketplaceProtocol';
import { useContext, useEffect, useState } from 'react';
import { ItemsFilterNavbar } from './CollectionPage/CollectionItems/ItemsFilterNavbar';
import { ItemsPaginationNavbar } from './CollectionPage/CollectionItems/ItemsPaginationNavbar';
import { ItemsGrid } from './CollectionPage/CollectionItems/ItemsGrid';
import { ItemCard } from './CollectionPage/CollectionItems/ItemCard';
import { SelectableItemCard } from './CollectionPage/CollectionItems/SelectableItemCard';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { useFulfillOrder } from '../packages/order/useFulfillOrder';

type UseQueryOrdersResult = UseQueryResult<{ data: { orders: WithSignature<Order>[] } }>;

interface BuyOrderLoaderData extends collectionLoaderData {
  tokenId: string;
}

export function buyOrderLoader(loaderArgs: LoaderFunctionArgs): BuyOrderLoaderData {
  const collectionLoaderResult = collectionLoader(loaderArgs);
  const tokenId = loaderArgs.params.tokenId!;

  return { tokenId, ...collectionLoaderResult };
}

export function BuyOrderPage() {
  const { tokenId } = useLoaderData() as BuyOrderLoaderData;
  const collection = useContext(CollectionContext);
  const userTokenIds = useContext(UserTokenIdsContext);
  const { address } = useAccount();
  const { data: userBalance } = useBalance({ address });
  const navigate = useNavigate();
  const { isFulfillConfirmed, fulfillOrder } = useFulfillOrder();
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const [tokensPage, setTokensPage] = useState(0);
  const [paginatedTokenIds, setPaginatedTokenIds] = useState<string[]>([]);
  const [sortedTokenIds, setSortedTokenIds] = useState<string[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);

  useEffect(() => {
    if (isFulfillConfirmed) navigate(`/c/${collection.key}?myItems=1`);
  }, [isFulfillConfirmed]);

  useEffect(() => {
    const filteredTokenIdsCopy = [...filteredTokenIds];
    filteredTokenIdsCopy.sort((a) => (userTokenIds.includes(a) ? -1 : 1));
    setSortedTokenIds(filteredTokenIdsCopy);
  }, [filteredTokenIds.join('-')]);

  const { data: ordersResult }: UseQueryOrdersResult = useQuery({
    initialData: { data: { orders: [] } },
    queryKey: [collection?.address],
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection: collection?.address, tokenIds: [tokenId] }, null, 2),
      }).then((res) => res.json()),
  });

  const order = ordersResult.data.orders[0];
  if (!order) {
    return <>Loading...</>;
  }

  const tokenIds = order.fulfillmentCriteria.token.identifier;

  function handleSelectToken(tokenId: string) {
    const selectLimit = Number(order.fulfillmentCriteria.token.amount);

    let tokenIds = [...selectedTokens];
    if (tokenIds.includes(tokenId)) {
      tokenIds = tokenIds.filter((id) => id != tokenId);
    } else {
      if (selectedTokens.length >= selectLimit) {
        return;
      }
      tokenIds.push(tokenId);
    }
    setSelectedTokens(tokenIds);
  }

  const isUserBalanceEnough =
    (userBalance?.value || 0n) >= BigInt(order.fulfillmentCriteria.coin?.amount || '');
  const isSelectedTokensEnough =
    selectedTokens.length >= Number(order.fulfillmentCriteria.token.amount);

  const fulfillOrderArgs: WithSelectedTokenIds<WithSignature<Order>> = {
    ...order,
    selectedTokenIds: selectedTokens,
  };

  return (
    <div>
      <button onClick={() => navigate(`/c/${collection.key}/`)}>{'<'} back</button>
      <h2>Fulfill order</h2>
      <ItemsFilterNavbar
        tokenIds={tokenIds}
        setFilteredTokenIds={setFilteredTokenIds}
        onFilterSelect={() => setTokensPage(0)}
      ></ItemsFilterNavbar>
      <ItemsGrid>
        {paginatedTokenIds.map((tokenId) => {
          if (userTokenIds.includes(tokenId)) {
            return (
              <SelectableItemCard
                key={tokenId}
                tokenId={tokenId}
                onSelect={() => handleSelectToken(tokenId)}
                isSelected={selectedTokens.includes(tokenId)}
              ></SelectableItemCard>
            );
          }
          return (
            <div key={tokenId} className="w-1/6 grayscale">
              <ItemCard tokenId={tokenId}></ItemCard>
            </div>
          );
        })}
      </ItemsGrid>
      <ItemsPaginationNavbar
        items={sortedTokenIds}
        setPaginatedItems={setPaginatedTokenIds}
        page={tokensPage}
        setPage={setTokensPage}
      ></ItemsPaginationNavbar>

      <div className="flex bg-gray-900">
        <div className="w-1/3">
          <img className="w-full" src={`/${collection.key}/${tokenId}.png`} />
          <div className="text-center">
            {collection.name} #{tokenId}
          </div>
        </div>
        <div className="w-2/3">
          <div>You pay</div>
          {order.fulfillmentCriteria.coin?.amount && (
            <div className="w-full bg-gray-600">
              {formatEther(BigInt(order.fulfillmentCriteria.coin?.amount))} ETH
            </div>
          )}
          <div className="w-full bg-gray-600 mt-1">
            <div>
              {order.fulfillmentCriteria.token.amount} {collection.symbol}
              <div className="flex gap-1">
                {selectedTokens.map((tokenId) => (
                  <div
                    key={tokenId}
                    className="w-12 cursor-pointer"
                    onClick={() => handleSelectToken(tokenId)}
                  >
                    <ItemCard tokenId={tokenId}></ItemCard>
                  </div>
                ))}
              </div>
            </div>
            <hr />
            {[]}
          </div>
          <button className="w-1/3" onClick={() => navigate(`/c/${collection.key}`)}>
            Cancel
          </button>
          <button
            onClick={() => fulfillOrder(fulfillOrderArgs)}
            className="w-2/3 bg-green-500 disabled:bg-gray-500"
            disabled={!isUserBalanceEnough || !isSelectedTokensEnough}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
