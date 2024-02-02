import { useContext } from 'react';
import { useSignTypedData } from 'wagmi';
import { CollectionContext } from '../../pages/App';
import {
  TypedMessage,
  marketplaceProtocolEIP712Default,
  marketplaceProtocolEIP712Message,
} from './marketplaceProtocol';

export function useSignOrder() {
  const collection = useContext(CollectionContext);
  const { signTypedData } = useSignTypedData();

  function signOrder(args: Omit<TypedMessage, 'token'>) {
    return signTypedData({
      message: marketplaceProtocolEIP712Message({ ...args, token: collection.address }),
      ...marketplaceProtocolEIP712Default(),
    });
  }

  return { signOrder };
}
