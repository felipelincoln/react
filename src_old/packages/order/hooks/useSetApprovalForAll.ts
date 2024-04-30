import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { marketplaceProtocolContractAddress, seaportConduit } from '../marketplaceProtocol';
import { useContext } from 'react';
import { CollectionContext, UserAddressContext } from '../../../pages/App';
import { useMutation } from '@tanstack/react-query';
import erc721abi from '../contractAbi/erc721.abi.json';

export function useSetApprovalForAll({ contract }: { contract?: `0x${string}` }) {
  const collection = useContext(CollectionContext);
  const { data: address } = useContext(UserAddressContext);
  const { data: hash, writeContractAsync } = useWriteContract();
  const {
    isSuccess: isSetApprovalConfirmed,
    isFetching: isSetApprovalConfirming,
    error: waitError,
  } = useWaitForTransactionReceipt({ hash });

  const {
    data: isApprovedForAllData,
    isFetching: isApprovedForAllFetching,
    error: readError,
  } = useReadContract({
    address: contract || '0x',
    abi: erc721abi,
    functionName: 'isApprovedForAll',
    args: [address, seaportConduit()],
  });

  const {
    mutate: setApprovalForAll,
    mutateAsync: setApprovalForAllAsync,
    isPending: isPendingMutation,
    error: mutateError,
  } = useMutation({
    mutationFn: async () => {
      if (isApprovedForAllData == undefined) return;
      if (isApprovedForAllData) return;

      return await writeContractAsync({
        address: contract || '0x',
        abi: erc721abi,
        functionName: 'setApprovalForAll',
        args: [seaportConduit(), true],
      });
    },
  });

  const isPending = isPendingMutation || isApprovedForAllFetching || isSetApprovalConfirming;
  const isApprovedForAll = isPending ? undefined : isApprovedForAllData || isSetApprovalConfirmed;
  const error = mutateError || readError || waitError;

  return { hash, setApprovalForAll, setApprovalForAllAsync, isApprovedForAll, isPending, error };
}
