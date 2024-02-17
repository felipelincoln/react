import { useSignTypedData } from 'wagmi';
import {
  Order,
  marketplaceProtocolEIP712Default,
  marketplaceProtocolEIP712Message,
} from './marketplaceProtocol';

export function useSignOrder() {
  const { signTypedData, data } = useSignTypedData();

  function signOrder(args: Order) {
    return signTypedData({
      message: marketplaceProtocolEIP712Message(args),
      ...marketplaceProtocolEIP712Default(),
    });
  }

  return { data, signOrder };
}
