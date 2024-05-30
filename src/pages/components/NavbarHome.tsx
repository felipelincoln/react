import { useNavigate } from 'react-router-dom';
import { CollectoorLogo } from './CollectoorLogo';
import { Button, Input } from '.';
import { useState } from 'react';
import { isAddress } from 'viem';

export function NavbarHome() {
  const navigate = useNavigate();
  const [contract, setContract] = useState('');
  const [error, setError] = useState<string | undefined>();

  return (
    <div className="fixed top-0 z-20 w-full bg-zinc-900">
      <div className="h-24 flex px-8 box-content border-b-2 border-zinc-800">
        <div className="my-4 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <CollectoorLogo />
          <div className="text-xl text-zinc-200">
            Collectoor<span className="text-zinc-400 text-xs mr-1"> (beta)</span>
          </div>
        </div>
        <div className="flex h-8 my-8 flex-grow justify-end items-center gap-4">
          {error && <div className="text-red-400">{error}</div>}
          <div className="flex gap-2">
            <Input
              placeholder="0x00123..."
              onChange={(e) => {
                setContract(e.target.value);
                setError(undefined);
              }}
              value={contract}
            />
            <Button
              onClick={() => {
                if (isAddress(contract)) {
                  navigate(`/c/${contract}`);
                  return;
                }

                setError('Invalid contract address');
              }}
            >
              Go
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
