import { useEffect, useState } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { config } from '../config';

type ValidateChainStatus = 'idle' | 'pending' | 'success' | 'error';

export function useValidateChain({ run }: { run: boolean }) {
  const { chainId } = useAccount();
  const { switchChain, isPending, isError, reset } = useSwitchChain();
  const [status, setStatus] = useState<ValidateChainStatus>('idle');
  const isValidChain = chainId == config.eth.chain.id;

  useEffect(() => {
    if (!run) return;
    if (isValidChain) return;

    switchChain({ chainId: config.eth.chain.id });
  }, [run, isValidChain]);

  useEffect(() => {
    if (!run) {
      setStatus('idle');
      return;
    }
    if (isError) {
      setStatus('error');
      return;
    }
    if (isValidChain) {
      setStatus('success');
      return;
    }
    if (isPending) {
      setStatus('pending');
      return;
    }
  }, [run, isValidChain, isPending, isError]);

  useEffect(() => {
    if (!run) {
      reset();
    }
  }, [run]);

  return { status, isSuccess: status == 'success', isError };
}
