import { useWriteContract } from 'wagmi';
import { seaportAbi, seaportContractAddress } from '../eth';
import { config } from '../config';

export function useIncrementCounter() {
  const { data, isIdle, isPending, isError, error, writeContract } = useWriteContract();

  // TODO: add all logic here

  function incrementCounter() {
    writeContract({
      abi: seaportAbi(),
      address: seaportContractAddress(),
      functionName: 'incrementCounter',
      chainId: config.eth.chain.id,
    });
  }

  return { incrementCounter, data, isIdle, isPending, isError, error };
}
