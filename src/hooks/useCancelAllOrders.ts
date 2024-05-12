import { useEffect, useState } from 'react';
import { useQueryUntil, useSeaportIncrementCounter, useValidateChain } from '.';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { fetchOrders, fetchUserOrders } from '../api/query';
import { QueryClient, useQueryClient } from '@tanstack/react-query';

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
      queryClient.invalidateQueries({ queryKey: [fetchOrders(contract, []).queryKey[0]] });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError || isSuccess) {
      setStart(false);
    }
  }, [isError, isSuccess]);

  function cancelAllOrders() {
    setStart(true);
  }

  return {
    cancelAllOrders,
    isValidChainStatus,
    seaportIncrementCounterStatus,
    userOrdersQueryStatus,
    isSuccess,
    isError,
  };
}
