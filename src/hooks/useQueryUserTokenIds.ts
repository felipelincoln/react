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
  const { data, isFetching, isFetched, refetch } = useQuery<{
    data?: { tokens: string[] };
    error?: string;
  }>({
    enabled: !!collection && !!address && isConnected && !disabled,
    queryKey: ['user_token_ids'],
    staleTime: Infinity,
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection?.key}/${address}`).then((res) => res.json()),
  });

  const isError = !!data?.error;
  const userTokenIds = isError ? [] : data?.data?.tokens;

  return { data: userTokenIds, isFetching, isFetched, refetch };
}
