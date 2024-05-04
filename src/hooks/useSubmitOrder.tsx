import { useContext, useEffect, useState } from 'react';
import {
  OrderFragment,
  WithCounter,
  seaportAbi,
  seaportContractAddress,
  seaportEip712Default,
  seaportEip712Message,
} from '../eth';
import { useValidateChain } from './useValidateChain';
import { useAccount, useReadContract, useSignTypedData } from 'wagmi';
import { DialogContext } from '../pages';
import { ButtonLight, SpinnerIcon } from '../pages/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postOrder } from '../api/mutation';
import { Order } from '../api/types';
import { fetchCollection, fetchOrders, fetchUserOrders } from '../api/query';
import { useNavigate, useParams } from 'react-router-dom';

export function useSubmitOrder() {
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { address } = useAccount();
  const { setDialog } = useContext(DialogContext);
  const [orderFragment, setOrderFragment] = useState<OrderFragment | undefined>();
  const { data: isChainValid, validateChain } = useValidateChain();

  const { data: counter, isPending: counterIsPending } = useReadContract({
    address: seaportContractAddress(),
    abi: seaportAbi(),
    functionName: 'getCounter',
    args: [orderFragment?.offerer],
    query: { enabled: !!isChainValid },
  });

  const { data: orderHash, isPending: orderHashIsPending } = useReadContract({
    address: seaportContractAddress(),
    abi: seaportAbi(),
    functionName: 'getOrderHash',
    args:
      orderFragment && counter != undefined
        ? [seaportEip712Message({ ...orderFragment, counter: counter!.toString() })]
        : [],
    query: { enabled: counter != undefined },
  });

  const { data: signature, signTypedData, isPending: signTypedDataIsPending } = useSignTypedData();
  const { mutate: mutatePostOrder, data: mutatePostOrderData } = useMutation(
    postOrder({ ...orderFragment!, orderHash: orderHash as string, signature: signature! }),
  );

  useEffect(() => {
    if (!orderFragment) return;
    validateChain();
  }, [orderFragment]);

  useEffect(() => {
    if (!counter) return;
    if (!orderFragment) return;
    const order: WithCounter<OrderFragment> = {
      ...orderFragment,
      counter: counter.toString(),
    };

    signTypedData({
      message: seaportEip712Message(order),
      ...seaportEip712Default(),
    });
  }, [counter]);

  useEffect(() => {
    if (orderFragment && counterIsPending) {
      setDialog(
        <div>
          <div className="flex flex-col items-center gap-4 min-w-64 max-w-lg">
            <div className="w-full font-medium pb-4">Create order</div>
            <SpinnerIcon />
            <div>Generating seaport order...</div>
          </div>
        </div>,
      );
    }
  }, [counterIsPending, orderFragment]);

  useEffect(() => {
    if (orderFragment && signTypedDataIsPending) {
      setDialog(
        <div>
          <div className="flex flex-col items-center gap-4 min-w-64 max-w-lg">
            <div className="w-full font-medium pb-4">Create order</div>
            <SpinnerIcon />
            <div>Confirm in your wallet</div>
          </div>
        </div>,
      );
    }
  }, [signTypedDataIsPending, orderFragment]);

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

    setDialog(
      <div className="flex flex-col items-center gap-4">
        <div>Order created!</div>
        <ButtonLight
          onClick={() => {
            navigate(`/c/${contract}`);
            setDialog(undefined);
          }}
        >
          Ok
        </ButtonLight>
      </div>,
    );
  }, [mutatePostOrderData]);

  function submitOrder(arg: OrderFragment) {
    setOrderFragment(arg);
  }

  return { submitOrder };
}

// TODO: allowance
