import { useAccount, useSwitchChain } from 'wagmi';
import { DialogContext } from '../pages/App';
import { useContext, useEffect } from 'react';
import { SpinnerIcon } from '../pages/components';
import { useMutation } from '@tanstack/react-query';
import { config } from '../config';

export function useValidateChain() {
  const { chainId } = useAccount();
  const { setDialog } = useContext(DialogContext);
  const { switchChainAsync } = useSwitchChain();

  const { data, isIdle, isPending, isError, error, mutate } = useMutation({
    mutationFn: async () => {
      if (chainId == config.eth.chain.id) {
        return true;
      }

      await switchChainAsync({ chainId: config.eth.chain.id });
      return true;
    },
  });

  useEffect(() => {
    if (chainId == config.eth.chain.id) return;
    if (isPending) {
      setDialog(
        <div>
          <div className="flex flex-col items-center gap-4 min-w-64 max-w-lg">
            <div className="w-full font-medium pb-4">Switch chain</div>
            <SpinnerIcon />
            <div>Confirm in your wallet</div>
          </div>
        </div>,
      );
    }
  }, [isPending]);

  return { data, isIdle, isPending, isError, error, validateChain: mutate };
}
