import { useContext, useMemo } from 'react';
import { FilterContext } from './CollectionPage';
import { AttributeTags, CardNftOrder } from './components';
import { useParams } from 'react-router-dom';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchCollection, fetchOrders, fetchTokenIds, fetchUserTokenIds } from '../api/query';
import { useAccount, useBalance } from 'wagmi';
import { userCanFulfillOrder } from '../utils';

export function CollectionOrdersPage() {
  const { filter, setFilter } = useContext(FilterContext);
  const contract = useParams().contract!;
  const { address } = useAccount();
  const { data: userBalance } = useBalance({ address });
  const { data: collectionResponse } = useQuery(fetchCollection(contract));
  const { data: tokenIdsResponse } = useSuspenseQuery(fetchTokenIds(contract, filter));
  const { data: ordersResponse } = useSuspenseQuery(
    fetchOrders(contract, tokenIdsResponse.data?.tokens || []),
  );
  const { data: userTokenIdsResponse } = useQuery({
    enabled: !!address,
    ...fetchUserTokenIds(contract, address!),
  });

  const collection = collectionResponse!.data!.collection;
  const tokenImages = collectionResponse!.data!.tokenImages || {};
  const orders = ordersResponse?.data?.orders;
  const userTokenIds = userTokenIdsResponse?.data?.tokenIds;

  const ordersSorted = useMemo(() => {
    if (!orders) return [];
    if (!address) return orders;
    if (!userTokenIds) return orders;
    if (!userBalance) return orders;

    const ordersCopy = [...orders];
    ordersCopy.sort((a, b) => {
      const tokenPriceA = Number(a.fulfillmentCriteria.token.amount);
      const tokenPriceB = Number(b.fulfillmentCriteria.token.amount);
      const coinPriceA = BigInt(a.fulfillmentCriteria.coin?.amount || '0');
      const coinPriceB = BigInt(b.fulfillmentCriteria.coin?.amount || '0');

      const userCanFulfillA = userCanFulfillOrder(a, userTokenIds, userBalance.value, address);
      const userCanFulfillB = userCanFulfillOrder(b, userTokenIds, userBalance.value, address);

      if (userCanFulfillA && !userCanFulfillB) {
        return -1;
      } else if (!userCanFulfillA && userCanFulfillB) {
        return 1;
      }

      if (tokenPriceA !== tokenPriceB) {
        return tokenPriceA - tokenPriceB;
      }

      if (coinPriceA !== coinPriceB) {
        return coinPriceA < coinPriceB ? -1 : 1;
      }

      return 0;
    });

    console.log('> [app] sorting feed');

    return ordersCopy;
    /* eslint-disable react-hooks/exhaustive-deps */
  }, [orders?.map((o) => o.tokenId).join('-'), userTokenIds?.join('-'), userBalance, address]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className="flex-grow p-8">
      <div className="flex h-8 gap-4 items-center">
        <div className="flex items-center gap-2 *:leading-8">
          <div>{orders?.length}</div>
          <div>Results</div>
        </div>
        <AttributeTags collection={collection} filter={filter} setFilter={setFilter} />
      </div>
      <div className="flex flex-wrap gap-4 pt-8">
        {ordersSorted.map((order) => (
          <CardNftOrder
            key={order.tokenId}
            priceToken={order.fulfillmentCriteria.token.amount}
            priceEth={order.fulfillmentCriteria.coin?.amount}
            contract={collection.contract}
            symbol={collection.symbol}
            src={tokenImages[order.tokenId]}
            tokenId={order.tokenId}
            canFullfill={userCanFulfillOrder(
              order,
              userTokenIds || [],
              userBalance?.value || 0n,
              address || '',
            )}
          ></CardNftOrder>
        ))}
      </div>
    </div>
  );
}
