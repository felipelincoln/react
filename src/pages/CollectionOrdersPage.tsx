import { useContext } from 'react';
import { FilterContext } from './CollectionPage';
import { AttributeTags, CardNftOrder } from './components';
import { useParams } from 'react-router-dom';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchCollection, fetchOrders, fetchTokenIds, fetchUserTokenIds } from '../api/query';
import { useAccount, useBalance } from 'wagmi';
import { etherToString, userCanFulfillOrder } from '../utils';

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
  const tokenImages = collectionResponse!.data!.tokenImages;
  const orders = ordersResponse?.data?.orders!;

  return (
    <div className="flex-grow p-8">
      <div className="flex h-8 gap-4 items-center">
        <div className="flex items-center gap-2 *:leading-8">
          <div>{orders.length}</div>
          <div>Results</div>
        </div>
        <AttributeTags collection={collection} filter={filter} setFilter={setFilter} />
      </div>
      <div className="flex flex-wrap gap-4 pt-8">
        {orders.map((order) => (
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
              userTokenIdsResponse?.data?.tokenIds || [],
              userBalance?.value || 0n,
              address || '',
            )}
          ></CardNftOrder>
        ))}
      </div>
    </div>
  );
}
