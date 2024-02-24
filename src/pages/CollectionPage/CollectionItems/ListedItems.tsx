import { useContext, useState } from 'react';
import { ItemsFilterNavbar } from './ItemsFilterNavbar';
import { CollectionContext } from '../../App';
import { ItemsGrid } from './ItemsGrid';
import { ItemsPaginationNavbar } from './ItemsPaginationNavbar';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { Order, WithSignature } from '../../../packages/order/marketplaceProtocol';
import { ListedItemCard } from './ListedItemCard';

type UseQueryOrdersResult = UseQueryResult<{ data: { orders: WithSignature<Order>[] } }>;

export function ListedItems() {
  const collection = useContext(CollectionContext);
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const [paginatedTokenIds, setPaginatedTokenIds] = useState<string[]>([]);
  const [tokensPage, setTokensPage] = useState(0);

  const { data: ordersResult }: UseQueryOrdersResult = useQuery({
    initialData: { data: { orders: [] } },
    queryKey: [collection.address],
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collection: collection.address }, null, 2),
      }).then((res) => res.json()),
  });

  const tokenIds = ordersResult.data.orders.map((order) => order.tokenId);
  const ordersByTokenId: { [tokenId: string]: WithSignature<Order> } = {};
  ordersResult.data.orders.forEach((order) => (ordersByTokenId[order.tokenId] = order));

  return (
    <div>
      <ItemsFilterNavbar
        tokenIds={tokenIds}
        setFilteredTokenIds={setFilteredTokenIds}
        onFilterSelect={() => setTokensPage(0)}
      ></ItemsFilterNavbar>
      <ItemsGrid>
        {paginatedTokenIds.map((tokenId) => (
          <ListedItemCard
            key={tokenId}
            tokenId={tokenId}
            order={ordersByTokenId[tokenId]}
          ></ListedItemCard>
        ))}
      </ItemsGrid>
      <ItemsPaginationNavbar
        tokenIds={filteredTokenIds}
        setPaginatedItems={setPaginatedTokenIds}
        page={tokensPage}
        setPage={setTokensPage}
      ></ItemsPaginationNavbar>
    </div>
  );
}
