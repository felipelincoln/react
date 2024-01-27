import { CollectionHeader } from './CollectionPage/CollectionHeader';
import { CollectionItems } from './CollectionPage/CollectionItems';
import { Navbar } from './components/Navbar';
import { useAccount } from 'wagmi';
import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CollectionActivity } from './CollectionPage/CollectionActivity';
import { useContext } from 'react';
import { CollectionContext } from './App';

type UseQueryResultData = UseQueryResult<{ data: { tokens: string[] } }>;

export function CollectionPage() {
  const { address: userAddress, isConnected } = useAccount();
  const [searchParams] = useSearchParams();
  const { address: collectionAddress } = useContext(CollectionContext);

  const showActivityTab = searchParams.get('activity') === '1';

  const { data: result }: UseQueryResultData = useQuery({
    initialData: { data: { tokens: [] } },
    queryKey: ['user_token_ids'],
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collectionAddress}/${userAddress}`).then((res) =>
        res.json(),
      ),
    enabled: isConnected,
  });

  const userTokenIds = result.data.tokens;

  return (
    <>
      <Navbar userTokenBalance={userTokenIds.length}></Navbar>
      <CollectionHeader></CollectionHeader>
      {!showActivityTab && <CollectionItems userTokenIds={userTokenIds}></CollectionItems>}
      {showActivityTab && <CollectionActivity></CollectionActivity>}
    </>
  );
}
