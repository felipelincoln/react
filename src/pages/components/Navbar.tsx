import { useContext } from 'react';
import { CollectionContext, UserTokenIdsContext } from '../App';
import ConnectButton from './ConnectButton';
import { useAccount, useBalance, useEnsName } from 'wagmi';

export function Navbar() {
  const collection = useContext(CollectionContext);
  const userTokenIds = useContext(UserTokenIdsContext);
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: balance } = useBalance({ address });

  return (
    <div className="bg-gray-700 h-20">
      <div className="flex justify-between">
        <div>
          <div>
            <a href={`/c/${collection.key}/`}>{collection.name}</a>
          </div>
        </div>
        {isConnected ? (
          <div className="flex space-x-10">
            <div>
              {`${userTokenIds.length}`} {collection.symbol}
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
