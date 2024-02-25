import { useWriteContract } from 'wagmi';
import {
  Order,
  WithSelectedTokenIds,
  WithSignature,
  marketplaceProtocolABI,
  marketplaceProtocolContractAddress,
  marketplaceProtocolFulfillOrderArgs,
} from './marketplaceProtocol';
import { useCheckCollectionAllowance } from './useCheckCollectionAllowance';
import { useEffect, useState } from 'react';

export function useFulfillOrder() {
  const { data, writeContract } = useWriteContract();
  const { isApprovedForAll, setApprovalForAll } = useCheckCollectionAllowance();
  const [args, setArgs] = useState<WithSelectedTokenIds<WithSignature<Order>>>();

  useEffect(() => {
    if (!!args && isApprovedForAll) {
      setArgs(undefined);
      writeContract(
        {
          abi: marketplaceProtocolABI(),
          address: marketplaceProtocolContractAddress(),
          functionName: 'fulfillAdvancedOrder',
          args: marketplaceProtocolFulfillOrderArgs(args),
          value: BigInt(args.fulfillmentCriteria.coin?.amount || '0'),
        },
        { onError: (error) => console.error(error) },
      );
    }
  }, [!!args, isApprovedForAll]);

  function fulfillOrder(args: WithSelectedTokenIds<WithSignature<Order>>) {
    setArgs(args);
    setApprovalForAll();
  }

  return { data, fulfillOrder };
}
