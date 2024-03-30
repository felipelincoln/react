import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';

export function useQueryUserBalance({ disabled } = { disabled: false }) {
  const { address, isConnected } = useAccount();
  const { data, isFetching, isFetched, refetch } = useQuery<{
    data?: { balance: string };
    error?: string;
  }>({
    enabled: !!address && isConnected && !disabled,
    queryKey: ['eth_user_balance'],
    staleTime: Infinity,
    queryFn: () =>
      fetch(`http://localhost:3000/eth/user/balance/${address}`).then((res) => res.json()),
  });

  const isError = !!data?.error;
  const userBalance = isError ? '0' : data?.data?.balance;

  return { data: userBalance, isFetching, isFetched, refetch };
}
