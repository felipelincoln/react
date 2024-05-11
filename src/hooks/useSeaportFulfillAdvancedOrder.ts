import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { WithSelectedTokenIds, seaportAbi, seaportFulfillAdvancedOrderArgs } from '../eth';
import { erc20Abi } from 'viem';
import { config } from '../config';
import { Order } from '../api/types';
import { useQueryClient } from '@tanstack/react-query';
import { fetchCollection } from '../api/query';
import { useParams } from 'react-router-dom';

type SeaportFulfillAdvancedOrderStatus =
  | 'idle'
  | 'pending:write'
  | 'pending:receipt'
  | 'success'
  | 'error';

export function useSeaportFulfillAdvancedOrder(args: {
  query?: { enabled?: boolean };
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
    if (!args.query?.enabled) return;

    writeContract({
      abi: [...seaportAbi(), ...erc20Abi],
      address: config.eth.seaport.contract,
      functionName: 'fulfillAdvancedOrder',
      args: seaportFulfillAdvancedOrderArgs(args.order),
      value:
        BigInt(args.order.fulfillmentCriteria.coin?.amount || '0') +
        BigInt(args.order.fee?.amount || '0'),
    });
  }, [args.query?.enabled]);

  useEffect(() => {
    if (!writeContractReceiptData) return;

    if (writeContractReceiptData?.transactionHash == hash) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey[0] != fetchCollection(contract).queryKey[0];
        },
      });
    }
  }, [writeContractReceiptData]);

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
    isError: status === 'error',
  };
}
