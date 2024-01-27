import { CollectionHeader } from './CollectionPage/CollectionHeader';
import { CollectionItems } from './CollectionPage/CollectionItems';
import { Navbar } from './components/Navbar';
import { useAccount } from 'wagmi';
import { UseQueryResult, useQuery } from '@tanstack/react-query';

type UseQueryResultData = UseQueryResult<{ data: { tokens: string[] } }>;

export function CollectionPage() {
  const { address, isConnected } = useAccount();

  const { data: result }: UseQueryResultData = useQuery({
    initialData: { data: { tokens: [] } },
    queryKey: ['user_token_ids'],
    queryFn: () => fetch(`http://localhost:3000/tokens/${address}`).then((res) => res.json()),
    enabled: isConnected,
  });

  const userTokenIds = result.data.tokens;

  return (
    <>
      <Navbar userTokenBalance={userTokenIds.length}></Navbar>
      <CollectionHeader></CollectionHeader>
      <CollectionItems userTokenIds={userTokenIds}></CollectionItems>
    </>
  );
}
