import { useWriteContract } from 'wagmi';
import {
  Order,
  WithSelectedTokenIds,
  WithSignature,
  marketplaceProtocolABI,
  marketplaceProtocolContractAddress,
  marketplaceProtocolFulfillOrderArgs,
} from './marketplaceProtocol';

export function useFulfillOrder() {
  const { data, writeContract } = useWriteContract();

  function fulfillOrder(order: WithSelectedTokenIds<WithSignature<Order>>, ethAmount?: bigint) {
    writeContract(
      {
        abi: marketplaceProtocolABI(),
        address: marketplaceProtocolContractAddress(),
        functionName: 'fulfillAdvancedOrder',
        args: marketplaceProtocolFulfillOrderArgs(order),
        value: ethAmount,
      },
      { onError: (error) => console.error(error) },
    );
  }
  return { data, fulfillOrder };
}
