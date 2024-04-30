import { useSignTypedData } from 'wagmi';
import {
  Order,
  WithCounter,
  marketplaceProtocolEIP712Default,
  marketplaceProtocolEIP712Message,
} from '../marketplaceProtocol';

export function useSignOrder() {
  const { signTypedData, data: signature, isPending, error } = useSignTypedData();

  function signOrder(order: WithCounter<Order>) {
    signTypedData({
      message: marketplaceProtocolEIP712Message(order),
      ...marketplaceProtocolEIP712Default(),
    });
  }

  return { signature, signOrder, isPending, error };
}
