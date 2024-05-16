import { useEffect, useState } from 'react';
import {
  OrderFragment,
  seaportAbi,
  seaportContractAddress,
  seaportEip712Default,
  seaportEip712Message,
} from '../eth';
import { useReadContract, useSignTypedData } from 'wagmi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postOrder as postOrderQuery } from '../api/mutation';
import { fetchOrders, fetchUserOrders } from '../api/query';
import { useParams } from 'react-router-dom';
import { useValidateChain } from '.';
import { useSeaportAllowance } from './seaport';

export function useSubmitOrder() {
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const [orderFragment, setOrderFragment] = useState<OrderFragment | undefined>();

  const {
    status: isValidChainStatus,
    isSuccess: isValidChain,
    isError: isValidChainIsError,
  } = useValidateChain({ run: !!orderFragment });

  const {
    status: isApprovedForAllStatus,
    isSuccess: isApprovedForAll,
    isError: isApprovedForAllIsError,
  } = useSeaportAllowance({
    run: !!orderFragment && isValidChain,
  });

  const { data: counter, isError: counterIsError } = useReadContract({
    address: seaportContractAddress(),
    abi: seaportAbi(),
    functionName: 'getCounter',
    args: [orderFragment?.offerer],
    query: { enabled: !!orderFragment && isValidChain },
  });

  const { data: orderHash, isError: orderHashIsError } = useReadContract({
    address: seaportContractAddress(),
    abi: seaportAbi(),
    functionName: 'getOrderHash',
    args:
      orderFragment && counter != undefined
        ? [
            seaportEip712Message({
              ...orderFragment,
              counter: counter!.toString(),
            }),
          ]
        : [],
    query: { enabled: !!orderFragment && isValidChain && counter != undefined },
  });

  const {
    data: signature,
    signTypedData,
    status: signatureStatus,
    isError: signatureIsError,
  } = useSignTypedData();

  const {
    mutate: postOrder,
    data: postOrderData,
    status: postOrderStatus,
    isError: postOrderIsError,
  } = useMutation(
    postOrderQuery({
      ...orderFragment!,
      orderHash: orderHash as string,
      signature: signature!,
    }),
  );

  const isSuccess = !!postOrderData;
  const isError =
    isValidChainIsError ||
    isApprovedForAllIsError ||
    counterIsError ||
    orderHashIsError ||
    signatureIsError ||
    postOrderIsError;

  useEffect(() => {
    if (!orderFragment) return;
    if (!isValidChain) return;
    if (!isApprovedForAll) return;
    if (counter == undefined) return;
    if (!orderHash) return;

    signTypedData({
      message: seaportEip712Message({
        ...orderFragment,
        counter: counter.toString(),
      }),
      ...seaportEip712Default(),
    });
  }, [orderFragment, isValidChain, isApprovedForAll, counter, orderHash, signTypedData, postOrder]);

  useEffect(() => {
    if (orderFragment && orderHash && signature) {
      postOrder();
    }
  }, [orderFragment, orderHash, signature, postOrder]);

  useEffect(() => {
    if (!postOrderData) return;

    queryClient.invalidateQueries({
      predicate: (query) => {
        const userOrdersQueryKey = fetchUserOrders(contract, '').queryKey[0];
        const ordersQueryKey = fetchOrders(contract, []).queryKey[0];

        if (query.queryKey[0] == userOrdersQueryKey) return true;
        if (query.queryKey[0] == ordersQueryKey) return true;

        return false;
      },
    });
  }, [postOrderData, contract, queryClient]);

  useEffect(() => {
    if (isError || isSuccess) {
      setOrderFragment(undefined);
    }
  }, [isError, isSuccess]);

  function submitOrder(arg: OrderFragment) {
    setOrderFragment(arg);
  }

  return {
    submitOrder,
    isSuccess,
    isError,
    isValidChainStatus,
    isApprovedForAllStatus,
    signatureStatus,
    postOrderStatus,
  };
}
