import { useEffect, useState } from 'react';
import { useValidateChain } from '.';
import { fetchOrders, fetchUserOrders } from '../api/query';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Order } from '../api/types';
import { useSeaportCancelOrder } from './seaport';
import { useQueryUntil } from './core';

export function useCancelOrder() {
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<Order | undefined>();
  const start = !!order;

  const {
    status: isValidChainStatus,
    isSuccess: isValidChain,
    isError: isValidChainIsError,
  } = useValidateChain({ run: start });

  const {
    status: seaportCancelOrderStatus,
    isSuccess: seaportCancelOrderIsSuccess,
    isError: seaportCancelOrderIsError,
  } = useSeaportCancelOrder({ order: order, run: start && isValidChain });

  const {
    status: userOrdersQueryStatus,
    isSuccess: userOrdersQueryIsSuccess,
    isError: userOrdersQueryIsError,
  } = useQueryUntil({
    ...fetchOrders(contract, order ? [order.tokenId] : []),
    queryUntilFn: (response) => response?.data?.orders.length === 0,
    enabled: start && isValidChain && seaportCancelOrderIsSuccess,
  });

  const isError = isValidChainIsError || userOrdersQueryIsError || seaportCancelOrderIsError;
  const isSuccess = isValidChain && userOrdersQueryIsSuccess && seaportCancelOrderIsSuccess;

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => {
          const ordersQueryKey = fetchOrders(contract, []).queryKey;
          const userOrdersQueryKey = fetchUserOrders(contract, '').queryKey;

          return queryKey[0] === ordersQueryKey[0] || queryKey[0] === userOrdersQueryKey[0];
        },
      });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError || isSuccess) {
      setOrder(undefined);
    }
  }, [isError, isSuccess]);

  function cancelOrder(order: Order) {
    setOrder(order);
  }

  return {
    cancelOrder,
    isValidChainStatus,
    userOrdersQueryStatus,
    seaportCancelOrderStatus,
    isError,
    isSuccess,
  };
}
