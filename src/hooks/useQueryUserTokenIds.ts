import { useQuery } from '@tanstack/react-query';
import { CollectionDetails } from '../collection/collections';
import { useAccount } from 'wagmi';

export function useQueryUserTokenIds({ collection }: { collection?: CollectionDetails }) {
  const { address, isConnected } = useAccount();
  const {
    data: rawData,
    isFetching,
    isFetched,
  } = useQuery<{ data: { tokens: string[] } }>({
    enabled: !!collection && !!address && isConnected,
    queryKey: ['userTokenIds', collection?.key, address],
    queryFn: () =>
      fetch(`http://localhost:3000/tokens/${collection?.key}/${address}`).then((res) => res.json()),
  });

  const data = rawData && rawData.data.tokens;

  return { data, isFetching, isFetched };
}
