import { useContext, useState } from 'react';
import { ItemsFilterNavbar } from './ItemsFilterNavbar';
import { CollectionContext, UserTokenIdsContext } from '../../App';
import { ItemsGrid } from './ItemsGrid';
import { ItemsPaginationNavbar } from './ItemsPaginationNavbar';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { Order, WithSignature } from '../../../packages/order/marketplaceProtocol';
import { UserItemCard } from './UserItemCard';

type UseQueryOrdersResult = UseQueryResult<{ data: { orders: WithSignature<Order>[] } }>;

export function UserItems() {
  const userTokenIds = useContext(UserTokenIdsContext);
  const collection = useContext(CollectionContext);
  const [filteredTokenIds, setFilteredTokenIds] = useState<string[]>([]);
  const [paginatedTokenIds, setPaginatedTokenIds] = useState<string[]>([]);
  const [tokensPage, setTokensPage] = useState(0);

  const { data: ordersResult }: UseQueryOrdersResult = useQuery({
    initialData: { data: { orders: [] } },
    queryKey: [userTokenIds.join('-')],
    enabled: !!userTokenIds.length,
    queryFn: () =>
      fetch(`http://localhost:3000/orders/list/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenIds: userTokenIds, collection: collection.address }, null, 2),
      }).then((res) => res.json()),
  });

  const ordersByTokenId: { [tokenId: string]: WithSignature<Order> } = {};
  ordersResult.data.orders.forEach((order) => (ordersByTokenId[order.tokenId] = order));

  return (
    <div>
      <ItemsFilterNavbar
        tokenIds={userTokenIds}
        setFilteredTokenIds={setFilteredTokenIds}
        onFilterSelect={() => setTokensPage(0)}
      ></ItemsFilterNavbar>
      <ItemsGrid>
        {paginatedTokenIds.map((tokenId) => (
          <UserItemCard
            key={tokenId}
            tokenId={tokenId}
            order={ordersByTokenId[tokenId]}
          ></UserItemCard>
        ))}
      </ItemsGrid>
      <ItemsPaginationNavbar
        items={filteredTokenIds}
        setPaginatedItems={setPaginatedTokenIds}
        page={tokensPage}
        setPage={setTokensPage}
      ></ItemsPaginationNavbar>
    </div>
  );
}
