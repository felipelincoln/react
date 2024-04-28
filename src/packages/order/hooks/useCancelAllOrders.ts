import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { marketplaceProtocolABI, marketplaceProtocolContractAddress } from '../marketplaceProtocol';
import { useContext } from 'react';
import { CollectionContext } from '../../../pages/App';
import { useMutation } from '@tanstack/react-query';
import { erc721Abi } from 'viem';

export function useCancelAllOrders() {
  const { data: hash, writeContractAsync } = useWriteContract();
  const {
    isSuccess,
    isFetching: isPendingWait,
    error: errorWait,
  } = useWaitForTransactionReceipt({ hash });

  const {
    mutate,
    isPending: isPendingMutation,
    error,
  } = useMutation({
    mutationFn: async () => {
      return await writeContractAsync({
        abi: [...marketplaceProtocolABI(), ...erc721Abi],
        address: marketplaceProtocolContractAddress(),
        functionName: 'incrementCounter',
      });
    },
  });

  return {
    hash,
    isConfirmed: isSuccess,
    isPending: isPendingMutation || isPendingWait,
    cancelAllOrders: mutate,
    error: error || errorWait,
  };
}
