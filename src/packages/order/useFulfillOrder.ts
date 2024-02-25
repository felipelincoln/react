import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
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
  const { data: hash, writeContract } = useWriteContract();
  const { isSuccess: isFulfillConfirmed } = useWaitForTransactionReceipt({ hash });
  const { isApprovedForAll, setApprovalForAll } = useCheckCollectionAllowance();
  const [args, setArgs] = useState<WithSelectedTokenIds<WithSignature<Order>>>();
  const [sendWriteContract, setSendWriteContract] = useState(false);

  useEffect(() => {
    if (!!args && isApprovedForAll && sendWriteContract) {
      setSendWriteContract(false);
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
  }, [!!args, isApprovedForAll, sendWriteContract]);

  function fulfillOrder(args: WithSelectedTokenIds<WithSignature<Order>>) {
    setSendWriteContract(true);
    setArgs(args);
    setApprovalForAll();
  }

  return { isFulfillConfirmed, fulfillOrder };
}
