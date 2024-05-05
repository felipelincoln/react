import { useContext, useEffect, useState } from 'react';
import {
  OrderFragment,
  WithCounter,
  seaportAbi,
  seaportContractAddress,
  seaportEip712Default,
  seaportEip712Message,
} from '../eth';
import { useAccount, useReadContract, useSignTypedData, useSwitchChain } from 'wagmi';
import { DialogContext } from '../pages';
import { ButtonLight, SpinnerIcon } from '../pages/components';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postOrder } from '../api/mutation';
import { fetchCollection, fetchOrders, fetchUserOrders } from '../api/query';
import { useNavigate, useParams } from 'react-router-dom';
import { config } from '../config';

export function useSubmitOrder() {
  const { setDialog } = useContext(DialogContext);
  const contract = useParams().contract!;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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

  const { data: orderHash, error: orderHashError } = useReadContract({
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
      signTypedDataError ||
      mutatePostOrderError
    ) {
      setOrderFragment(undefined);
      setDialog(undefined);
    }
  }, [switchChainError, counterError, orderHashError, signTypedDataError, mutatePostOrderError]);

  useEffect(() => {
    if (!orderFragment) return;
    if (chainId == config.eth.chain.id) return;

    switchChain({ chainId: config.eth.chain.id });
  }, [orderFragment]);

  useEffect(() => {
    if (switchChainIsPending) {
      setDialog(
        <div>
          <div className="flex flex-col items-center gap-4 min-w-64 max-w-lg">
            <div className="w-full font-medium pb-4">Switch chain</div>
            <SpinnerIcon />
            <div>Confirm in your wallet</div>
          </div>
        </div>,
      );
    }
  }, [switchChainIsPending]);

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
  }, [orderFragment, counterIsPending]);

  useEffect(() => {
    if (!counter) return;
    if (!orderFragment) return;
    if (chainId != config.eth.chain.id) return;
    const order: WithCounter<OrderFragment> = {
      ...orderFragment,
      counter: counter.toString(),
    };

    signTypedData({
      message: seaportEip712Message(order),
      ...seaportEip712Default(),
    });
  }, [orderFragment, chainId, counter]);

  useEffect(() => {
    if (signTypedDataIsPending) {
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
  }, [signTypedDataIsPending]);

  useEffect(() => {
    if (orderFragment && orderHash && signature) {
      mutatePostOrder();
    }
  }, [orderFragment, orderHash, signature]);

  useEffect(() => {
    if (!mutatePostOrderIsPending) return;

    setDialog(
      <div>
        <div className="flex flex-col items-center gap-4 min-w-64 max-w-lg">
          <div className="w-full font-medium pb-4">Create order</div>
          <SpinnerIcon />
          <div>Creating order...</div>
        </div>
      </div>,
    );
  }, [mutatePostOrderIsPending]);

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
