import { useMutation } from '@tanstack/react-query';
import { sepolia } from 'viem/chains';
import { useAccount, useSwitchChain } from 'wagmi';

export function useCheckChain() {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const {
    mutate: checkChain,
    data,
    isPending,
    error,
  } = useMutation({
    mutationFn: async () => {
      if (chainId === sepolia.id) return chainId;

      return (await switchChainAsync({ chainId: sepolia.id })).id;
    },
  });

  const isValidChain = data === sepolia.id;

  return { checkChain, isValidChain, isPending, error };
}
