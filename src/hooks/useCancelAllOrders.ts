import { useEffect, useState } from 'react';
import { useSeaportIncrementCounter, useValidateChain } from '.';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { fetchOrders, fetchUserOrders } from '../api/query';

export function useCancelAllOrders() {
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [start, setStart] = useState(false);
  const [userOrdersQueryStatus, setUserOrdersQueryStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');

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
    data: userOrdersQueryResponse,
    isFetching: userOrdersQueryIsFetching,
    isError: userOrdersQueryIsError,
  } = useQuery({
    ...fetchUserOrders(contract, address!),
    refetchInterval: 1000,
    enabled: start && seaportIncrementCounterIsSuccess && userOrdersQueryStatus != 'success',
  });

  useEffect(() => {
    if (!start) return;
    if (!seaportIncrementCounterIsSuccess) return;
    if (userOrdersQueryStatus == 'success') return;

    if (userOrdersQueryResponse?.data?.orders.length == 0) {
      setUserOrdersQueryStatus('success');
      queryClient.invalidateQueries({
        predicate: (query) => {
          const userOrdersQueryKey = fetchUserOrders(contract, address!).queryKey[0];
          const ordersQueryKey = fetchOrders(contract, []).queryKey[0];

          if (query.queryKey[0] == userOrdersQueryKey) return true;
          if (query.queryKey[0] == ordersQueryKey) return true;

          return false;
        },
      });

      return;
    }

    if (userOrdersQueryIsFetching) {
      setUserOrdersQueryStatus('pending');
      return;
    }

    if (userOrdersQueryIsError) {
      setUserOrdersQueryStatus('error');
      return;
    }
  }, [start, userOrdersQueryResponse, userOrdersQueryIsFetching, userOrdersQueryIsError]);

  useEffect(() => {
    if (seaportIncrementCounterIsError || isValidChainIsError) {
      setStart(false);
    }
  }, [seaportIncrementCounterIsError, isValidChainIsError]);

  useEffect(() => {
    if (start) return;

    setUserOrdersQueryStatus('idle');
    queryClient.resetQueries({
      queryKey: ['no-cache', ...fetchUserOrders(contract, address!).queryKey],
    });
  }, [start]);

  function cancelAllOrders() {
    setStart(true);
  }

  return {
    cancelAllOrders,
    isValidChainStatus,
    seaportIncrementCounterStatus,
    userOrdersQueryStatus,
    isSuccess: seaportIncrementCounterIsSuccess && userOrdersQueryStatus == 'success',
    isError: seaportIncrementCounterIsError || isValidChainIsError,
  };
}

export function useQueryUntil(args: {
  queryKey: any[];
  queryFn: () => Promise<any>;
  refetchInterval: number;
  enabled: boolean;
}) {
  const { data } = useQuery({ ...args, staleTime: 0 });
}
