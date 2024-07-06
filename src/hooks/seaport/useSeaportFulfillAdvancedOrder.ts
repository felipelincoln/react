import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { WithSelectedTokenIds, seaportAbi, seaportFulfillAdvancedOrderArgs } from '../../eth';
import { erc20Abi } from 'viem';
import { config } from '../../config';
import { Order } from '../../api/types';
import { useQueryClient } from '@tanstack/react-query';
import { verifiedCollections } from '../../verifiedCollections';

type SeaportFulfillAdvancedOrderStatus =
  | 'idle'
  | 'pending:write'
  | 'pending:receipt'
  | 'success'
  | 'error';

export function useSeaportFulfillAdvancedOrder({
  run,
  order,
}: {
  run: boolean;
  order: WithSelectedTokenIds<Order>;
}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SeaportFulfillAdvancedOrderStatus>('idle');

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
    queryKey: [writeContractReceiptQueryKey],
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!run) return;

    const verifiedCollection = verifiedCollections[order.contract];

    writeContract({
      abi: [...seaportAbi(), ...erc20Abi],
      address: config.web3.seaport.contract,
      functionName: 'fulfillAdvancedOrder',
      args: seaportFulfillAdvancedOrderArgs(order),
      value:
        BigInt(verifiedCollection?.royalty?.amount || '0') +
        BigInt(order.fulfillmentCriteria.coin?.amount || '0') +
        BigInt(order.fee?.amount || '0'),
    });
  }, [run, order, writeContract]);

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
    hash,
    writeContractError,
    writeContractIsPending,
    writeContractReceiptData,
    writeContractReceiptError,
    writeContractReceiptIsPendingQuery,
  ]);

  useEffect(() => {
    if (!run) {
      resetWriteContract();
      queryClient.resetQueries({ queryKey: [writeContractReceiptQueryKey] });
    }
  }, [run, queryClient, resetWriteContract, writeContractReceiptQueryKey]);

  return {
    status,
    isSuccess: status === 'success',
    isError: status === 'error',
  };
}
