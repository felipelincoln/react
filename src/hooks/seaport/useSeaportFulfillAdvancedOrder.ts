import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { WithSelectedTokenIds, seaportAbi, seaportFulfillAdvancedOrderArgs } from '../../eth';
import { erc20Abi } from 'viem';
import { config } from '../../config';
import { Order } from '../../api/types';
import { useQueryClient } from '@tanstack/react-query';
import { fetchCollection } from '../../api/query';
import { useParams } from 'react-router-dom';

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
  const contract = useParams().contract!;
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
    queryKey: writeContractReceiptQueryKey,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (!run) return;

    writeContract({
      abi: [...seaportAbi(), ...erc20Abi],
      address: config.eth.seaport.contract,
      functionName: 'fulfillAdvancedOrder',
      args: seaportFulfillAdvancedOrderArgs(order),
      value:
        BigInt(order.fulfillmentCriteria.coin?.amount || '0') + BigInt(order.fee?.amount || '0'),
    });
  }, [run]);

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
