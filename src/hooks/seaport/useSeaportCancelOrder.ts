import { useEffect, useState } from 'react';
import { Order } from '../../api/types';
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { seaportAbi, seaportCancelOrderArgs, seaportContractAddress } from '../../eth';
import { useQueryClient } from '@tanstack/react-query';
import { config } from '../../config';

type SeaportCancelOrderStatus =
  | 'idle'
  | 'pending:read'
  | 'pending:write'
  | 'pending:receipt'
  | 'success'
  | 'error';

export function useSeaportCancelOrder({ run, order }: { run: boolean; order?: Order }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SeaportCancelOrderStatus>('idle');

  const {
    data: counter,
    isPending: readCounterIsPending,
    isError: readCounterError,
    queryKey: [readCounterQueryKey],
  } = useReadContract({
    address: seaportContractAddress(),
    abi: seaportAbi(),
    functionName: 'getCounter',
    args: [order?.offerer],
    query: { enabled: run && !!order },
  });

  const {
    data: hash,
    writeContract,
    isPending: writeContractIsPending,
    isError: writeContractIsError,
    reset: resetWriteContract,
  } = useWriteContract();

  const {
    data: writeContractReceiptData,
    isPending: writeContractReceiptIsPendingQuery,
    isError: writeContractReceiptIsError,
    queryKey: [writeContractReceiptQueryKey],
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!order) return;
    if (!run) return;
    if (counter == undefined) return;

    writeContract({
      abi: seaportAbi(),
      address: seaportContractAddress(),
      chainId: config.eth.chain.id,
      functionName: 'cancel',
      args: order
        ? seaportCancelOrderArgs({
            ...order,
            counter: (counter as bigint).toString(),
          })
        : [],
    });
  }, [order, run, counter, writeContract]);

  useEffect(() => {
    if (!run || !order) {
      setStatus('idle');
      return;
    }
    if (readCounterError || writeContractIsError || writeContractReceiptIsError) {
      setStatus('error');
      return;
    }
    if (!!hash && writeContractReceiptData?.transactionHash == hash) {
      setStatus('success');
      return;
    }
    if (readCounterIsPending) {
      setStatus('pending:read');
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
    hash,
    order,
    readCounterError,
    readCounterIsPending,
    writeContractIsError,
    writeContractIsPending,
    writeContractReceiptData,
    writeContractReceiptIsError,
    writeContractReceiptIsPendingQuery,
  ]);

  useEffect(() => {
    if (!run) {
      resetWriteContract();
      queryClient.invalidateQueries({
        predicate: ({ queryKey }) => {
          return (
            queryKey[0] === readCounterQueryKey || queryKey[0] === writeContractReceiptQueryKey
          );
        },
      });
    }
  }, [run, queryClient, readCounterQueryKey, resetWriteContract, writeContractReceiptQueryKey]);

  return {
    status,
    isError: status === 'error',
    isSuccess: status === 'success',
  };
}
