import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import {
  Order,
  marketplaceProtocolABI,
  marketplaceProtocolContractAddress,
} from './marketplaceProtocol';
import { useContext } from 'react';
import { CollectionContext } from '../../pages/App';

export function useCancelAllOrders() {
  const collection = useContext(CollectionContext);
  const { data: hash, writeContract, error: writeError } = useWriteContract();
  const { isSuccess, isFetching, error } = useWaitForTransactionReceipt({ hash });

  function cancelAllOrders() {
    writeContract({
      abi: [...marketplaceProtocolABI(), ...collection.abi],
      address: marketplaceProtocolContractAddress(),
      functionName: 'incrementCounter',
    });
  }

  return {
    data: hash,
    isSuccess,
    isFetching,
    cancelAllOrders,
    error: error?.message || writeError?.message,
  };
}
