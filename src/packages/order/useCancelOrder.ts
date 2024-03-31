import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import {
  Order,
  WithSelectedTokenIds,
  WithSignature,
  marketplaceProtocolABI,
  marketplaceProtocolContractAddress,
  marketplaceProtocolEIP712Message,
  marketplaceProtocolFulfillOrderArgs,
} from './marketplaceProtocol';
import { useContext } from 'react';
import { CollectionContext } from '../../pages/App';

export function useCancelOrder() {
  const collection = useContext(CollectionContext);
  const { data: hash, writeContract, error: writeError } = useWriteContract();
  const { isSuccess, isFetching, error } = useWaitForTransactionReceipt({ hash });

  function cancelOrder(args: WithSignature<Order>) {
    writeContract({
      abi: [...marketplaceProtocolABI(), ...collection.abi],
      address: marketplaceProtocolContractAddress(),
      functionName: 'cancel',
      args: marketplaceProtocolEIP712Message(args), // TODO: fix
    });
  }

  return {
    data: hash,
    isSuccess,
    isFetching,
    cancelOrder,
    error: error?.message || writeError?.message,
  };
}
