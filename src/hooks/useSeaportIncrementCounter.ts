import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { seaportAbi, seaportContractAddress } from '../eth';
import { config } from '../config';
import { useQueryClient } from '@tanstack/react-query';
import { fetchOrders, fetchUserOrders } from '../api/query';
import { useParams } from 'react-router-dom';

type SeaportIncrementCounterStatus =
  | 'idle'
  | 'pending:write'
  | 'pending:receipt'
  | 'success'
  | 'error';

export function useSeaportIncrementCounter({ run }: { run: boolean }) {
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SeaportIncrementCounterStatus>('idle');

  const {
    data: hash,
    writeContract,
    isPending: writeContractIsPending,
    error: writeContractError,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    data: writeContractReceiptData,
    isPending: writeContractReceiptIsPendingQuery,
    error: writeContractReceiptError,
    queryKey: writeContractReceiptQueryKey,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!run) return;

    writeContract({
      abi: seaportAbi(),
      address: seaportContractAddress(),
      functionName: 'incrementCounter',
      chainId: config.eth.chain.id,
    });
  }, [run]);

  useEffect(() => {
    if (!writeContractReceiptData) return;

    if (writeContractReceiptData?.transactionHash == hash) {
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
  }, [writeContractReceiptData]);

  useEffect(() => {
    if (!run) {
      setStatus('idle');
      return;
    }
    if (writeContractError || writeContractReceiptError) {
      setStatus('error');
      return;
    }
    if (!!hash && writeContractReceiptData?.transactionHash == hash) {
      setStatus('success');
      return;
    }
    if (writeContractIsPending) {
      setStatus('pending:write');
      return;
    }
    if (!!hash && writeContractReceiptIsPendingQuery) {
      setStatus('pending:receipt');
      return;
    }
  }, [
    run,
    writeContractError,
    writeContractIsPending,
    writeContractReceiptData,
    writeContractReceiptError,
    writeContractReceiptIsPendingQuery,
  ]);

  useEffect(() => {
    if (!run) {
      resetWriteContract();
      queryClient.resetQueries({ queryKey: writeContractReceiptQueryKey });
    }
  }, [run]);

  return {
    status,
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
