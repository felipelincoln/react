import { useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { config } from '../config';

export function useValidateChain(query?: { enabled?: boolean }) {
  const { chainId } = useAccount();
  const { switchChain, status, isError, reset } = useSwitchChain();

  useEffect(() => {
    if (query?.enabled == false) return;
    if (chainId == config.eth.chain.id) return;

    switchChain({ chainId: config.eth.chain.id });
  }, [query?.enabled, chainId]);

  useEffect(() => {
    if (!query?.enabled) reset();
  }, [!!query?.enabled]);

  const isValidChain = chainId == config.eth.chain.id;

  return { isValidChain, status, isError };
}
