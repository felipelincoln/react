import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import {
  Order,
  marketplaceProtocolABI,
  marketplaceProtocolCancelOrderArgs,
  marketplaceProtocolContractAddress,
  marketplaceProtocolEIP712Message,
} from './marketplaceProtocol';
import { useContext, useEffect, useState } from 'react';
import { CollectionContext } from '../../pages/App';

export function useCancelOrder() {
  const collection = useContext(CollectionContext);
  const { data: hash, writeContract, error: writeError } = useWriteContract();
  const { isSuccess, isFetching, error } = useWaitForTransactionReceipt({ hash });
  const [args, setArgs] = useState<Order>();
  const [sendWriteContract, setSendWriteContract] = useState(false);
  const { data: counter }: { data?: bigint } = useReadContract({
    address: marketplaceProtocolContractAddress(),
    abi: marketplaceProtocolABI(),
    functionName: 'getCounter',
    args: !!args ? [args.offerer] : [],
    query: { enabled: !!args },
  });

  useEffect(() => {
    if (!!args && sendWriteContract && counter !== undefined) {
      setSendWriteContract(false);
      writeContract({
        abi: [...marketplaceProtocolABI(), ...collection.abi],
        address: marketplaceProtocolContractAddress(),
        functionName: 'cancel',
        args: marketplaceProtocolCancelOrderArgs({ ...args, counter: counter.toString() }),
      });
    }
  }, [!!args, sendWriteContract, counter]);

  function cancelOrder(args: Order) {
    setSendWriteContract(true);
    setArgs(args);
  }

  return {
    data: hash,
    isSuccess,
    isFetching,
    cancelOrder,
    error: error?.message || writeError?.message,
  };
}
