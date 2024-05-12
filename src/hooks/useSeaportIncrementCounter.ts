import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { seaportAbi, seaportContractAddress } from '../eth';
import { config } from '../config';
import { useQueryClient } from '@tanstack/react-query';

type SeaportIncrementCounterStatus =
  | 'idle'
  | 'pending:write'
  | 'pending:receipt'
  | 'success'
  | 'error';

export function useSeaportIncrementCounter(args: { query?: { enabled?: boolean } }) {
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
    if (!args.query?.enabled) return;

    writeContract({
      abi: seaportAbi(),
      address: seaportContractAddress(),
      functionName: 'incrementCounter',
      chainId: config.eth.chain.id,
    });
  }, [args.query?.enabled]);

  useEffect(() => {
    if (!args.query?.enabled) {
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
    args.query?.enabled,
    writeContractError,
    writeContractIsPending,
    writeContractReceiptError,
    writeContractReceiptIsPendingQuery,
  ]);

  useEffect(() => {
    if (!args.query?.enabled) {
      resetWriteContract();
      queryClient.resetQueries({ queryKey: writeContractReceiptQueryKey });
    }
  }, [!!args.query?.enabled]);

  return {
    status,
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
