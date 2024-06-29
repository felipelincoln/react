import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '.';
import { isAddress } from 'viem';

export function HomeBanner() {
  const navigate = useNavigate();
  const [contract, setContract] = useState('');
  const [error, setError] = useState<string | undefined>();

  return (
    <div className="max-w-screen-lg w-full mx-auto">
      <div className="p-8 flex flex-col gap-8 items-center">
        <h1 className="font-bold text-4xl">The marketplace to swap NFTs</h1>
        <div className="flex flex-col flex-grow justify-end items-center gap-4">
          <div className="flex gap-2">
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
  );
}
