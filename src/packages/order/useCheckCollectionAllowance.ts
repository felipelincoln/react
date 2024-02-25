import { useContext, useEffect, useState } from 'react';
import { CollectionContext } from '../../pages/App';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { marketplaceProtocolContractAddress } from './marketplaceProtocol';

export function useCheckCollectionAllowance() {
  const collection = useContext(CollectionContext);
  const { address } = useAccount();
  const [callWriteContract, setCallWriteContract] = useState(false);
  const { data: hash, writeContract } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  const {
    data: isApprovedForAll = false,
    refetch: refetchApprovalForAll,
    isFetching: isFetchingApprovalForAll,
  } = useReadContract({
    address: collection.address,
    abi: collection.abi,
    functionName: 'isApprovedForAll',
    args: [address, marketplaceProtocolContractAddress()],
  });

  useEffect(() => {
    if (isConfirmed) refetchApprovalForAll();
  }, [isConfirmed]);

  useEffect(() => {
    if (callWriteContract && !isApprovedForAll && !isFetchingApprovalForAll) {
      setCallWriteContract(false);
      writeContract(
        {
          address: collection.address,
          abi: collection.abi,
          functionName: 'setApprovalForAll',
          args: [marketplaceProtocolContractAddress(), true],
        },
        { onError: (error) => console.error(error) },
      );
    }
  }, [callWriteContract, isApprovedForAll, isFetchingApprovalForAll]);

  function setApprovalForAll() {
    setCallWriteContract(true);
  }

  return {
    isApprovedForAll,
    setApprovalForAll,
  };
}
