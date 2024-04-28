import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useContext, useEffect, useState } from 'react';
import { CollectionContext } from '../../../pages/App';
import {
  Order,
  marketplaceProtocolABI,
  marketplaceProtocolCancelOrderArgs,
  marketplaceProtocolContractAddress,
} from '../marketplaceProtocol';
import { erc721Abi } from 'viem';

export function useCancelOrder() {
  const [args, setArgs] = useState<Order>();
  const { data: hash, writeContract, error: writeError } = useWriteContract();
  const {
    isSuccess: isConfirmed,
    isFetching: isFetchingWrite,
    error,
  } = useWaitForTransactionReceipt({ hash });
  const { data: counter, isFetching: isFetchingRead } = useReadContract({
    address: marketplaceProtocolContractAddress(),
    abi: marketplaceProtocolABI(),
    functionName: 'getCounter',
    args: !!args ? [args.offerer] : [],
    query: { enabled: !!args },
  });

  useEffect(() => {
    if (!!args && counter !== undefined) {
      writeContract({
        abi: [...marketplaceProtocolABI(), ...erc721Abi],
        address: marketplaceProtocolContractAddress(),
        functionName: 'cancel',
        args: marketplaceProtocolCancelOrderArgs({
          ...args,
          counter: (counter as bigint).toString(),
        }),
      });
      setArgs(undefined);
    }
  }, [!!args, counter]);

  function cancelOrder(args: Order) {
    setArgs(args);
  }

  return {
    hash,
    isConfirmed,
    cancelOrder,
    isPending: isFetchingRead || isFetchingWrite,
    error: error || writeError,
  };
}
