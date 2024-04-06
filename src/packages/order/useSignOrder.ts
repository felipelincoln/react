import {
  useInfiniteReadContracts,
  useReadContract,
  useReadContracts,
  useSignTypedData,
} from 'wagmi';
import {
  Order,
  marketplaceProtocolABI,
  marketplaceProtocolContractAddress,
  marketplaceProtocolEIP712Default,
  marketplaceProtocolEIP712Message,
} from './marketplaceProtocol';
import { useCheckCollectionAllowance } from './useCheckCollectionAllowance';
import { useEffect, useState } from 'react';
import { useCheckCollectionApproval } from './hooks/useCheckCollectionApproval';

export function useSignOrder() {
  const { signTypedData, data: signature } = useSignTypedData();
  const { isApprovedForAll, checkCollectionApproval, isPending } = useCheckCollectionApproval();
  const [args, setArgs] = useState<Order>();
  const [callSignTypedData, setCallSignTypedData] = useState(false);
  const { data: orderHash }: { data?: `0x${string}` } = useReadContract({
    address: marketplaceProtocolContractAddress(),
    abi: marketplaceProtocolABI(),
    functionName: 'getOrderHash',
    args: !!args ? [marketplaceProtocolEIP712Message(args)] : [],
    query: { enabled: !!args },
  });

  useEffect(() => {
    if (!!args && isApprovedForAll && callSignTypedData) {
      console.log('calling signOrder');
      setCallSignTypedData(false);
      signTypedData({
        message: marketplaceProtocolEIP712Message(args),
        ...marketplaceProtocolEIP712Default(),
      });
    }
  }, [!!args, isApprovedForAll, callSignTypedData]);

  function signOrder(args: Order) {
    setCallSignTypedData(true);
    setArgs(args);
    checkCollectionApproval();
  }

  return { signature, orderHash, signOrder };
}
