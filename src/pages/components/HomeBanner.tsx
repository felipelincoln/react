import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '.';
import { isAddress } from 'viem';

export function HomeBanner() {
  const navigate = useNavigate();
  const [contract, setContract] = useState('');
  const [error, setError] = useState<string | undefined>();

  return (
    <div className="bg-zinc-900 py-32 box-content border-b-2 border-zinc-800">
      <div className="max-w-screen-lg w-full mx-auto">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center gap-4">
            <h1 className="font-bold text-5xl">The marketplace to swap NFTs</h1>
            <h2 className="text-xl text-zinc-400">
              Create and fulfill trait-based listings using the OpenSea smart contract
            </h2>
          </div>
          <div className="flex flex-col flex-grow justify-end items-center gap-4">
            <div className="flex gap-2 hidden">
              <Input
                placeholder="NFT contract"
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
            {error && <div className="text-red-400">{error}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
