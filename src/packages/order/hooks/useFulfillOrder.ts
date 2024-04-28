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
import erc721abi from '../contractAbi/erc721.abi.json';

export function useFulfillOrder() {
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
        abi: [...marketplaceProtocolABI(), ...erc721abi],
        address: marketplaceProtocolContractAddress(),
        functionName: 'fulfillAdvancedOrder',
        args: marketplaceProtocolFulfillOrderArgs(order),
        value:
          BigInt(order.fulfillmentCriteria.coin?.amount || '0') + BigInt(order.fee?.amount || '0'),
      });
    },
  });

  const isPending = isPendingMutation || isFulfillTransactionPending;
  const error = mutateError || waitError;

  return { hash, isConfirmed, fulfillOrder, isPending, error };
}
