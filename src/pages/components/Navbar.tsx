import { useContext } from 'react';
import { CollectionContext } from '../App';
import ConnectButton from './ConnectButton';
import { useAccount, useBalance, useEnsName } from 'wagmi';

interface NavBarProps {
  userTokenBalance: number;
}

export function Navbar(props: NavBarProps) {
  const collection = useContext(CollectionContext);
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });

  return (
    <div className="bg-gray-700 h-20">
      <div className="flex justify-between">
        <div>
          <div>{collection.name}</div>
        </div>
        {isConnected ? (
          <div className="flex space-x-10">
            <div>
              {`${props.userTokenBalance}`} {collection.symbol}
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
