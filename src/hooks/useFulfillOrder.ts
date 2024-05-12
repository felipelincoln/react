import { useEffect, useState } from 'react';
import { Order } from '../api/types';
import { WithSelectedTokenIds } from '../eth';
import { useValidateChain } from './useValidateChain';
import { useSeaportAllowance, useSeaportFulfillAdvancedOrder } from '.';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCollection, fetchOrders } from '../api/query';
import { useParams } from 'react-router-dom';

export function useFulfillOrder() {
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const [order, setOrder] = useState<WithSelectedTokenIds<Order> | undefined>(undefined);
  const [orderQueryStatus, setOrderQueryStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

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

  const {
    status: fulfillAdvancedOrderStatus,
    isSuccess: fulfillAdvancedOrderIsSuccess,
    isError: fulfillAdvancedOrderIsError,
  } = useSeaportFulfillAdvancedOrder({
    order: order!,
    query: { enabled: !!order && isValidChain && isApprovedForAll },
  });

  const {
    data: orderQueryResponse,
    isFetching: orderQueryIsFetching,
    isError: orderQueryIsError,
  } = useQuery({
    ...fetchOrders(contract, order ? [order.tokenId] : []),
    refetchInterval: orderQueryStatus != 'success' ? 1_000 : false,
    enabled: fulfillAdvancedOrderIsSuccess && orderQueryStatus != 'success',
    staleTime: 0,
  });

  useEffect(() => {
    if (orderQueryStatus == 'success') return;

    if (orderQueryResponse?.data?.orders.length == 0) {
      setOrderQueryStatus('success');
      queryClient.invalidateQueries({
        predicate: (query) => {
          const collectionQueryKey = fetchCollection(contract).queryKey[0];
          const orderQueryKey = fetchOrders(contract, [order!.tokenId]);

          if (query.queryKey[0] == collectionQueryKey) return false;
          if (query.queryKey[0] == orderQueryKey) return false;

          return true;
        },
      });
      return;
    }

    if (orderQueryIsFetching) {
      setOrderQueryStatus('pending');
      return;
    }

    if (orderQueryIsError) {
      setOrderQueryStatus('error');
      return;
    }
  }, [orderQueryResponse, orderQueryIsFetching, orderQueryIsError]);

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
    isSuccess: fulfillAdvancedOrderIsSuccess && orderQueryStatus == 'success',
    isError: isValidChainIsError || isApprovedForAllIsError || fulfillAdvancedOrderIsError,
    isValidChainStatus,
    isApprovedForAllStatus,
    fulfillAdvancedOrderStatus,
    orderQueryStatus,
  };
}
