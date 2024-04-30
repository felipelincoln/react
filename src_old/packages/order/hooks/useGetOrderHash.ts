import { useReadContract } from 'wagmi';
import {
  Order,
  WithCounter,
  marketplaceProtocolABI,
  marketplaceProtocolContractAddress,
  marketplaceProtocolEIP712Message,
} from '../marketplaceProtocol';
import { useState } from 'react';

export function useGetOrderHash() {
  const [order, setOrder] = useState<Order | undefined>();
  const { data: counter, isFetching: isFetchingCounter } = useReadContract({
    address: marketplaceProtocolContractAddress(),
    abi: marketplaceProtocolABI(),
    functionName: 'getCounter',
    args: !!order ? [order.offerer] : [],
    query: { enabled: !!order },
  });
  const {
    data: orderHash,
    isFetching,
    error,
  } = useReadContract({
    address: marketplaceProtocolContractAddress(),
    abi: marketplaceProtocolABI(),
    functionName: 'getOrderHash',
    args:
      !!order && counter != undefined
        ? [marketplaceProtocolEIP712Message({ ...order, counter: counter?.toString() })]
        : [],
    query: { enabled: counter != undefined },
  });

  function getOrderHash(args: Order) {
    setOrder(args);
  }

  return {
    counter: counter?.toString(),
    orderHash,
    getOrderHash,
    isPending: isFetching || isFetchingCounter,
    error,
  };
}
