import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { CollectionContext } from '../../../pages/App';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import {
  Order,
  WithSelectedTokenIds,
  WithSignature,
  marketplaceProtocolABI,
  marketplaceProtocolContractAddress,
  marketplaceProtocolFulfillOrderArgs,
} from '../marketplaceProtocol';

export function useFulfillOrder() {
  const collection = useContext(CollectionContext);
  const { data: hash, writeContractAsync } = useWriteContract();
  const {
    isSuccess: isConfirmed,
    isFetching: isFulfillTransactionPending,
    error: waitError,
  } = useWaitForTransactionReceipt({ hash });

  const {
    mutate: fulfillOrder,
    isPending: isPendingMutation,
    error: mutateError,
  } = useMutation({
    mutationFn: async (order: WithSelectedTokenIds<WithSignature<Order>>) => {
      return await writeContractAsync({
        abi: [...marketplaceProtocolABI(), ...collection.abi],
        address: marketplaceProtocolContractAddress(),
        functionName: 'fulfillAdvancedOrder',
        args: marketplaceProtocolFulfillOrderArgs(order),
        value: BigInt(order.fulfillmentCriteria.coin?.amount || '0'),
      });
    },
  });

  const isPending = isPendingMutation || isFulfillTransactionPending;
  const error = mutateError || waitError;

  return { hash, isConfirmed, fulfillOrder, isPending, error };
}
