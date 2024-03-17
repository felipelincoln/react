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
import { useContext, useEffect, useState } from 'react';
import { CollectionContext } from '../../pages/App';

export function useFulfillOrder() {
  const collection = useContext(CollectionContext);
  const { data: hash, writeContract, error: writeError } = useWriteContract();
  const { isSuccess, isFetching, error } = useWaitForTransactionReceipt({ hash });
  const { isApprovedForAll, setApprovalForAll } = useCheckCollectionAllowance();
  const [args, setArgs] = useState<WithSelectedTokenIds<WithSignature<Order>>>();
  const [sendWriteContract, setSendWriteContract] = useState(false);

  useEffect(() => {
    if (!!args && isApprovedForAll && sendWriteContract) {
      setSendWriteContract(false);
      writeContract({
        abi: [...marketplaceProtocolABI(), ...collection.abi],
        address: marketplaceProtocolContractAddress(),
        functionName: 'fulfillAdvancedOrder',
        args: marketplaceProtocolFulfillOrderArgs(args),
        value: BigInt(args.fulfillmentCriteria.coin?.amount || '0'),
      });
    }
  }, [!!args, isApprovedForAll, sendWriteContract]);

  function fulfillOrder(args: WithSelectedTokenIds<WithSignature<Order>>) {
    setSendWriteContract(true);
    setArgs(args);
    setApprovalForAll();
  }

  return {
    data: hash,
    isSuccess,
    isFetching,
    fulfillOrder,
    error: error?.message || writeError?.message,
  };
}
