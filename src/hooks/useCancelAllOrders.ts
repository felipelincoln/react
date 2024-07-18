import { useEffect, useState } from 'react';
import { useValidateChain } from '.';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { fetchOrders, fetchUserOrders } from '../api/query';
import { useQueryClient } from '@tanstack/react-query';
import { useSeaportIncrementCounter } from './seaport';
import { useQueryUntil } from './core';

export function useCancelAllOrders() {
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [start, setStart] = useState(false);

  const {
    status: isValidChainStatus,
    isSuccess: isValidChain,
    isError: isValidChainIsError,
  } = useValidateChain({ run: start });

  const {
    data: seaportIncrementCounterData,
    status: seaportIncrementCounterStatus,
    isSuccess: seaportIncrementCounterIsSuccess,
    isError: seaportIncrementCounterIsError,
  } = useSeaportIncrementCounter({ run: start && isValidChain });

  const {
    status: userOrdersQueryStatus,
    isSuccess: userOrdersQueryIsSuccess,
    isError: userOrdersQueryIsError,
  } = useQueryUntil({
    ...fetchUserOrders(contract, address!),
    queryUntilFn: (response) => response?.data?.orders.length === 0,
    enabled: start && seaportIncrementCounterIsSuccess,
  });

  const isError = seaportIncrementCounterIsError || isValidChainIsError || userOrdersQueryIsError;
  const isSuccess = isValidChain && seaportIncrementCounterIsSuccess && userOrdersQueryIsSuccess;

  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => {
          const ordersQueryKey = fetchOrders(contract, []).queryKey;
          const userOrdersQueryKey = fetchUserOrders(contract, '').queryKey;

          if (queryKey[0] == ordersQueryKey[0]) return true;
          if (queryKey[0] == userOrdersQueryKey[0]) return true;

          return false;
        },
      });
    }
  }, [isSuccess, contract, queryClient]);

  useEffect(() => {
    if (isError || isSuccess) {
      setStart(false);
    }
  }, [isError, isSuccess]);

  function cancelAllOrders() {
    setStart(true);
  }

  return {
    cancelAllOrdersTxHash: seaportIncrementCounterData,
    cancelAllOrders,
    isValidChainStatus,
    seaportIncrementCounterStatus,
    userOrdersQueryStatus,
    isSuccess,
    isError,
  };
}
