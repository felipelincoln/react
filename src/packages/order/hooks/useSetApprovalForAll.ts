import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { marketplaceProtocolContractAddress } from '../marketplaceProtocol';
import { useContext } from 'react';
import { CollectionContext, UserAddressContext } from '../../../pages/App';
import { useMutation } from '@tanstack/react-query';

export function useSetApprovalForAll() {
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
    address: collection.address,
    abi: collection.abi,
    functionName: 'isApprovedForAll',
    args: [address, marketplaceProtocolContractAddress()],
  });

  const {
    mutate: setApprovalForAll,
    mutateAsync: setApprovalForAllAsync,
    isPending: isPendingMutation,
    error: mutateError,
  } = useMutation({
    meta: { abacaba: true },
    mutationFn: async () => {
      if (isApprovedForAllData == undefined) return;
      if (isApprovedForAllData) return;

      return await writeContractAsync({
        address: collection.address,
        abi: collection.abi,
        functionName: 'setApprovalForAll',
        args: [marketplaceProtocolContractAddress(), true],
      });
    },
  });

  const isPending = isPendingMutation || isApprovedForAllFetching || isSetApprovalConfirming;
  const isApprovedForAll = isPending ? undefined : isApprovedForAllData || isSetApprovalConfirmed;
  const error = mutateError || readError || waitError;

  return { hash, setApprovalForAll, setApprovalForAllAsync, isApprovedForAll, isPending, error };
}
