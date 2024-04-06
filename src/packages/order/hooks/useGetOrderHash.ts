import { useReadContract } from 'wagmi';
import {
  Order,
  marketplaceProtocolABI,
  marketplaceProtocolContractAddress,
  marketplaceProtocolEIP712Message,
} from '../marketplaceProtocol';
import { useState } from 'react';

export function useGetOrderHash() {
  const [order, setOrder] = useState<Order | undefined>();
  const {
    data: orderHash,
    isFetching,
    error,
  } = useReadContract({
    address: marketplaceProtocolContractAddress(),
    abi: marketplaceProtocolABI(),
    functionName: 'getOrderHash',
    args: !!order ? [marketplaceProtocolEIP712Message(order)] : [],
    query: { enabled: !!order },
  });

  function getOrderHash(args: Order) {
    setOrder(args);
  }

  return { orderHash, getOrderHash, isPending: isFetching, error };
}
