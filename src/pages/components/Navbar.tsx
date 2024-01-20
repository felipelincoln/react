import { useContext } from 'react';
import { CollectionContext } from '../App';
import ConnectButton from './ConnectButton';
import { useAccount, useBalance, useEnsName, useReadContract } from 'wagmi';
import { type UseReadContractReturnType } from 'wagmi';
import { parseEther, parseGwei } from 'viem';

export function Navbar() {
  const collection = useContext(CollectionContext);
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });

  const { data: tokenBalance } = useReadContract({
    abi: collection.abi,
    address: collection.address,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: isConnected },
  });

  return (
    <div className="bg-gray-700 h-20">
      <div className="flex justify-between">
        <div>
          <div>{collection.name}</div>
        </div>
        {isConnected ? (
          <div className="flex space-x-10">
            <div>
              {`${tokenBalance}`} {collection.symbol}
            </div>
            <div>
              {balance?.formatted} {balance?.symbol}
            </div>
            <div>{ensName ?? address}</div>
            <ConnectButton />
          </div>
        ) : (
          <div>
            <ConnectButton />
          </div>
        )}
      </div>
    </div>
  );
}
