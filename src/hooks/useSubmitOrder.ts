import { useEffect, useState } from 'react';
import {
  OrderFragment,
  WithCounter,
  seaportAbi,
  seaportContractAddress,
  seaportEip712Default,
  seaportEip712Message,
} from '../eth';
import {
  useAccount,
  useReadContract,
  useSignTypedData,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postOrder } from '../api/mutation';
import { fetchOrders, fetchUserOrders } from '../api/query';
import { useParams } from 'react-router-dom';
import { config } from '../config';
import { erc721Abi } from 'viem';

export function useSubmitOrder() {
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const { address, chainId } = useAccount();
  const [orderFragment, setOrderFragment] = useState<OrderFragment | undefined>();

  const {
    data: counter,
    isPending: counterIsPending,
    error: counterError,
  } = useReadContract({
    address: seaportContractAddress(),
    abi: seaportAbi(),
    functionName: 'getCounter',
    args: [orderFragment?.offerer],
    query: { enabled: !!orderFragment && chainId == config.eth.chain.id },
  });

  const {
    data: orderHash,
    error: orderHashError,
    isPending: orderHashIsPending,
  } = useReadContract({
    address: seaportContractAddress(),
    abi: seaportAbi(),
    functionName: 'getOrderHash',
    args:
      orderFragment && counter != undefined
        ? [seaportEip712Message({ ...orderFragment, counter: counter!.toString() })]
        : [],
    query: { enabled: !!orderFragment && chainId == config.eth.chain.id && counter != undefined },
  });

  const {
    data: isApprovedForAll,
    error: isApprovedForAllError,
    isPending: isApprovedForAllIsPending,
  } = useReadContract({
    address: contract as `0x${string}`,
    abi: erc721Abi,
    functionName: 'isApprovedForAll',
    args: [address!, config.eth.seaport.conduit],
    query: { enabled: !!orderFragment && chainId == config.eth.chain.id },
  });

  const {
    writeContract: setApprovalForAll,
    data: setApprovalForAllData,
    isPending: setApprovalForAllIsPending,
    error: setApprovalForAllError,
  } = useWriteContract();

  const {
    data: setApprovalForAllReceiptData,
    isPending: setApprovalForAllReceiptIsPending,
    error: setApprovalForAllReceiptError,
  } = useWaitForTransactionReceipt({
    hash: setApprovalForAllData,
  });

  const {
    switchChain,
    isPending: switchChainIsPending,
    error: switchChainError,
  } = useSwitchChain();

  const {
    data: signature,
    signTypedData,
    isPending: signTypedDataIsPending,
    error: signTypedDataError,
  } = useSignTypedData();

  const {
    mutate: mutatePostOrder,
    data: mutatePostOrderData,
    isPending: mutatePostOrderIsPending,
    error: mutatePostOrderError,
  } = useMutation(
    postOrder({ ...orderFragment!, orderHash: orderHash as string, signature: signature! }),
  );

  useEffect(() => {
    if (
      switchChainError ||
      counterError ||
      orderHashError ||
      isApprovedForAllError ||
      setApprovalForAllError ||
      setApprovalForAllReceiptError ||
      signTypedDataError ||
      mutatePostOrderError
    ) {
      setOrderFragment(undefined);
    }
  }, [
    switchChainError,
    counterError,
    orderHashError,
    isApprovedForAllError,
    setApprovalForAllError,
    setApprovalForAllReceiptError,
    signTypedDataError,
    mutatePostOrderError,
  ]);

  useEffect(() => {
    if (!orderFragment) return;
    if (chainId == config.eth.chain.id) return;

    switchChain({ chainId: config.eth.chain.id });
  }, [orderFragment]);

  useEffect(() => {
    if (!orderFragment) return;
    if (chainId != config.eth.chain.id) return;
    if (isApprovedForAll != false) return;

    setApprovalForAll({
      address: contract as `0x${string}`,
      abi: erc721Abi,
      functionName: 'setApprovalForAll',
      args: [config.eth.seaport.conduit, true],
    });
  }, [orderFragment, chainId, isApprovedForAll]);

  console.log({
    chainId,
    counter,
    orderHash,
    isApprovedForAll,
    setApprovalForAllReceiptData,
    setApprovalForAllData,
  });

  useEffect(() => {
    if (!orderFragment) return;
    if (chainId != config.eth.chain.id) return;
    if (!isApprovedForAll && setApprovalForAllReceiptData?.transactionHash != setApprovalForAllData)
      return;
    if (counter == undefined) return;
    if (!orderHash) return;

    signTypedData({
      message: seaportEip712Message({ ...orderFragment, counter: counter.toString() }),
      ...seaportEip712Default(),
    });
  }, [
    orderFragment,
    chainId,
    counter,
    orderHash,
    isApprovedForAll,
    setApprovalForAllReceiptData,
    setApprovalForAllData,
  ]);

  useEffect(() => {
    if (orderFragment && orderHash && signature) {
      mutatePostOrder();
    }
  }, [orderFragment, orderHash, signature]);

  useEffect(() => {
    if (!mutatePostOrderData) return;

    queryClient.invalidateQueries({
      predicate: (query) => {
        const userOrdersQueryKey = fetchUserOrders(contract, address!).queryKey[0];
        const ordersQueryKey = fetchOrders(contract, []).queryKey[0];

        if (query.queryKey[0] == userOrdersQueryKey) return true;
        if (query.queryKey[0] == ordersQueryKey) return true;

        return false;
      },
    });
  }, [mutatePostOrderData]);

  function submitOrder(arg: OrderFragment) {
    setOrderFragment(arg);
  }

  return {
    submitOrder,
    counterIsPending: !!orderFragment && counterIsPending,
    orderHashIsPending: !!orderFragment && orderHashIsPending,
    isApprovedForAllIsPending: !!orderFragment && isApprovedForAllIsPending,
    setApprovalForAllReceiptIsPending: !!setApprovalForAllData && setApprovalForAllReceiptIsPending,
    switchChainIsPending,
    setApprovalForAllIsPending,
    signTypedDataIsPending,
    mutatePostOrderIsPending,
    switchChainError,
    counterError,
    orderHashError,
    isApprovedForAllError,
    setApprovalForAllError,
    setApprovalForAllReceiptError,
    signTypedDataError,
    mutatePostOrderError,
    isSuccess: !!mutatePostOrderData,
  };
}
