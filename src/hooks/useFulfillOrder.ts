import { useEffect, useState } from 'react';
import { Order } from '../api/types';
import { WithSelectedTokenIds } from '../eth';
import { useValidateChain } from './useValidateChain';
import { useQueryUntil, useSeaportAllowance, useSeaportFulfillAdvancedOrder } from '.';
import { useQueryClient } from '@tanstack/react-query';
import { fetchCollection, fetchOrders } from '../api/query';
import { useParams } from 'react-router-dom';

export function useFulfillOrder() {
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<WithSelectedTokenIds<Order> | undefined>(undefined);

  const {
    status: isValidChainStatus,
    isSuccess: isValidChain,
    isError: isValidChainIsError,
  } = useValidateChain({ run: !!order });

  const {
    status: isApprovedForAllStatus,
    isSuccess: isApprovedForAll,
    isError: isApprovedForAllIsError,
  } = useSeaportAllowance({ run: !!order && isValidChain });

  const {
    status: fulfillAdvancedOrderStatus,
    isSuccess: fulfillAdvancedOrderIsSuccess,
    isError: fulfillAdvancedOrderIsError,
  } = useSeaportFulfillAdvancedOrder({
    order: order!,
    run: !!order && isValidChain && !!isApprovedForAll,
  });

  const {
    status: orderQueryStatus,
    isSuccess: orderQueryIsSuccess,
    isError: orderQueryIsError,
  } = useQueryUntil({
    ...fetchOrders(contract, order ? [order.tokenId] : []),
    queryUntilFn: (response) => response?.data?.orders.length == 0,
    enabled: !!order && isValidChain && !!isApprovedForAll && fulfillAdvancedOrderIsSuccess,
  });

  const isError =
    isValidChainIsError ||
    isApprovedForAllIsError ||
    fulfillAdvancedOrderIsError ||
    orderQueryIsError;

  const isSuccess =
    isValidChain && isApprovedForAll && fulfillAdvancedOrderIsSuccess && orderQueryIsSuccess;

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey[0] != fetchCollection(contract).queryKey[0],
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isSuccess || isError) {
      setOrder(undefined);
    }
  }, [isSuccess, isError]);

  function fulfillOrder(args: WithSelectedTokenIds<Order>) {
    setOrder(args);
  }

  return {
    fulfillOrder,
    isSuccess,
    isError,
    isValidChainStatus,
    isApprovedForAllStatus,
    fulfillAdvancedOrderStatus,
    orderQueryStatus,
  };
}
