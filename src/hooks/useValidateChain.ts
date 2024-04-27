import { useMutation } from '@tanstack/react-query';
import { sepolia } from 'viem/chains';
import { useAccount, useSwitchChain } from 'wagmi';
import { config } from '../config';

export function useValidateChain() {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const { mutate, mutateAsync, isPending, error } = useMutation({
    mutationFn: async () => {
      if (chainId === sepolia.id) return chainId;

      return (await switchChainAsync({ chainId: Number(config.ethereumNetwork) })).id;
    },
  });

  const isValidChain = chainId === Number(config.ethereumNetwork);

  return { switchChain: mutate, switchChainAsync: mutateAsync, isValidChain, isPending, error };
}
