import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { config } from '../../config';
import { erc721Abi } from 'viem';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

type SeaportAllowanceStatus =
  | 'idle'
  | 'pending:read'
  | 'pending:write'
  | 'pending:receipt'
  | 'success'
  | 'error';

export function useSeaportAllowance({ run }: { run: boolean }) {
  const { address } = useAccount();
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SeaportAllowanceStatus>('idle');

  const {
    data: isApprovedForAll,
    error: isApprovedForAllError,
    isPending: isApprovedForAllIsPendingQuery,
    queryKey: [isApprovedForAllQueryKey],
  } = useReadContract({
    address: contract as `0x${string}`,
    abi: erc721Abi,
    functionName: 'isApprovedForAll',
    args: [address!, config.web3.seaport.conduit],
    query: { enabled: run },
  });

  const {
    writeContract: setApprovalForAll,
    data: setApprovalForAllData,
    isPending: setApprovalForAllIsPendingMutation,
    error: setApprovalForAllError,
    reset: resetSetApprovalForAll,
  } = useWriteContract();

  const {
    data: setApprovalForAllReceiptData,
    isPending: setApprovalForAllReceiptIsPendingQuery,
    error: setApprovalForAllReceiptError,
    queryKey: [setApprovalForAllReceiptQueryKey],
  } = useWaitForTransactionReceipt({
    hash: setApprovalForAllData,
  });

  useEffect(() => {
    if (!run) return;
    if (isApprovedForAll != false) return;

    setApprovalForAll({
      address: contract as `0x${string}`,
      abi: erc721Abi,
      functionName: 'setApprovalForAll',
      args: [config.web3.seaport.conduit, true],
    });
  }, [run, isApprovedForAll, contract, setApprovalForAll]);

  useEffect(() => {
    if (!setApprovalForAllReceiptData) return;

    if (setApprovalForAllReceiptData?.transactionHash == setApprovalForAllData) {
      queryClient.resetQueries({ queryKey: [isApprovedForAllQueryKey] });
    }
  }, [setApprovalForAllReceiptData, setApprovalForAllData, isApprovedForAllQueryKey, queryClient]);

  useEffect(() => {
    if (!run) {
      setStatus('idle');
      return;
    }
    if (isApprovedForAllError || setApprovalForAllError || setApprovalForAllReceiptError) {
      setStatus('error');
      return;
    }
    if (isApprovedForAll) {
      setStatus('success');
      return;
    }
    if (isApprovedForAllIsPendingQuery) {
      setStatus('pending:read');
      return;
    }
    if (setApprovalForAllIsPendingMutation) {
      setStatus('pending:write');
      return;
    }
    if (setApprovalForAllData && setApprovalForAllReceiptIsPendingQuery) {
      setStatus('pending:receipt');
      return;
    }
  }, [
    run,
    isApprovedForAll,
    isApprovedForAllError,
    isApprovedForAllIsPendingQuery,
    setApprovalForAllIsPendingMutation,
    setApprovalForAllError,
    setApprovalForAllReceiptIsPendingQuery,
    setApprovalForAllReceiptError,
    setApprovalForAllData,
  ]);

  useEffect(() => {
    if (!run) {
      resetSetApprovalForAll();
      queryClient.resetQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] == isApprovedForAllQueryKey ||
          queryKey[0] == setApprovalForAllReceiptQueryKey,
      });
    }
  }, [
    run,
    isApprovedForAllQueryKey,
    queryClient,
    resetSetApprovalForAll,
    setApprovalForAllReceiptQueryKey,
  ]);

  return {
    status,
    isSuccess: isApprovedForAll,
    isError: status == 'error',
  };
}
