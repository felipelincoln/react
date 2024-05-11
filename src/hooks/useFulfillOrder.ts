import { useEffect, useState } from 'react';
import { Order } from '../api/types';
import { WithSelectedTokenIds } from '../eth';
import { useValidateChain } from './useValidateChain';
import { useSeaportAllowance, useSeaportFulfillAdvancedOrder } from '.';

export function useFulfillOrder() {
  const [order, setOrder] = useState<WithSelectedTokenIds<Order> | undefined>(undefined);

  const {
    isValidChain,
    status: isValidChainStatus,
    isError: isValidChainIsError,
  } = useValidateChain({ enabled: !!order });

  const {
    isApprovedForAll,
    status: isApprovedForAllStatus,
    isError: isApprovedForAllIsError,
  } = useSeaportAllowance({
    enabled: !!order && isValidChain,
  });

  const { status: fulfillAdvancedOrderStatus, isError: fulfillAdvancedOrderIsError } =
    useSeaportFulfillAdvancedOrder({
      order: order!,
      query: { enabled: !!order && isValidChain && isApprovedForAll },
    });

  useEffect(() => {
    if (isValidChainIsError || isApprovedForAllIsError || fulfillAdvancedOrderIsError) {
      setOrder(undefined);
    }
  }, [isValidChainIsError, isApprovedForAllIsError, fulfillAdvancedOrderIsError]);

  function fulfillOrder(args: WithSelectedTokenIds<Order>) {
    setOrder(args);
  }

  return {
    fulfillOrder,
    isSuccess: fulfillAdvancedOrderStatus == 'success',
    isError: isValidChainIsError || isApprovedForAllIsError || fulfillAdvancedOrderIsError,
    isValidChainStatus,
    isApprovedForAllStatus,
    fulfillAdvancedOrderStatus,
  };
}
