import { useMutation } from '@tanstack/react-query';
import { sepolia } from 'viem/chains';
import { useAccount, useSwitchChain } from 'wagmi';

export function useValidateChain() {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: async () => {
      if (chainId === sepolia.id) return chainId;

      return (await switchChainAsync({ chainId: sepolia.id })).id;
    },
  });

  const isValidChain = chainId === sepolia.id;

  return { switchChain: mutate, switchChainAsync: mutateAsync, isValidChain, isPending, error };
}
