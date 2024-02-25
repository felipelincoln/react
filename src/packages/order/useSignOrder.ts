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

export function useSignOrder() {
  const { signTypedData, data: signature } = useSignTypedData();
  const { isApprovedForAll, setApprovalForAll } = useCheckCollectionAllowance();
  const [args, setArgs] = useState<Order>();
  const [callSignTypedData, setCallSignTypedData] = useState(false);
  const { data: orderHash } = useReadContract({
    address: marketplaceProtocolContractAddress(),
    abi: marketplaceProtocolABI(),
    functionName: 'getOrderHash',
    args: !!args ? [marketplaceProtocolEIP712Message(args)] : [],
    query: { enabled: !!args },
  });

  useEffect(() => {
    if (!!args && isApprovedForAll && callSignTypedData) {
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
    setApprovalForAll();
  }

  return { signature, orderHash, signOrder };
}
