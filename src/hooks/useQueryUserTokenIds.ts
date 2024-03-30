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
    queryKey: ['eth_user_tokens'],
    staleTime: Infinity,
    queryFn: () =>
      fetch(`http://localhost:3000/eth/user/tokens/${collection?.key}/${address}`).then((res) =>
        res.json(),
      ),
  });

  const isError = !!data?.error;
  const userTokenIds = isError ? [] : data?.data?.tokens;

  return { data: userTokenIds, isFetching, isFetched, refetch };
}
