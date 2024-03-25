import { useQuery } from '@tanstack/react-query';
import { CollectionDetails } from '../collection/collections';
import { useAccount } from 'wagmi';

export function useQueryUserTokenIds({
  collection,
  disabled = false,
}: {
  collection?: CollectionDetails;
  disabled?: boolean;
}) {
  const { address, isConnected } = useAccount();
  const {
    data: userTokenIds,
    isFetching,
    isFetched,
    isStale,
    refetch,
  } = useQuery<{ data: { tokens: string[] } }>({
    enabled: !!collection && !!address && isConnected && !disabled,
    queryKey: ['user_token_ids'],
    staleTime: Infinity,
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection?.key}/${address}`).then((res) => res.json()),
  });

  console.log('CALLING useQueryUserTokenIds', { isStale, isFetching });

  const data = userTokenIds?.data.tokens;

  return { data, isFetching, isFetched, refetch };
}
