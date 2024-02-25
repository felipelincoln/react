import { useSignTypedData } from 'wagmi';
import {
  Order,
  marketplaceProtocolEIP712Default,
  marketplaceProtocolEIP712Message,
} from './marketplaceProtocol';
import { useCheckCollectionAllowance } from './useCheckCollectionAllowance';
import { useEffect, useState } from 'react';

export function useSignOrder() {
  const { signTypedData, data } = useSignTypedData();
  const { isApprovedForAll, setApprovalForAll } = useCheckCollectionAllowance();
  const [args, setArgs] = useState<Order>();

  useEffect(() => {
    if (!!args && isApprovedForAll) {
      setArgs(undefined);
      signTypedData({
        message: marketplaceProtocolEIP712Message(args),
        ...marketplaceProtocolEIP712Default(),
      });
    }
  }, [!!args, isApprovedForAll]);

  function signOrder(args: Order) {
    setArgs(args);
    setApprovalForAll();
  }

  return { data, signOrder };
}
