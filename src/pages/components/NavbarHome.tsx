import { useNavigate } from 'react-router-dom';
import { CollectoorLogo } from './CollectoorLogo';
import { Button } from './Button';
import ethereumLogo from '../../assets/eth-logo.webp';
import baseLogo from '../../assets/base-logo.webp';
import polygonLogo from '../../assets/polygon-logo.svg';
import { useState } from 'react';
import { config } from '../../config';

export function NavbarHome() {
  const navigate = useNavigate();
  const [showNetworks, setShowNetworks] = useState(false);

  const NetworkButtons = [
    <EthereumButton
      key="mainnet"
      onClick={() => {
        window.location.href = `https://${config.site.domain}`;
      }}
    />,
    <BaseButton
      key="base"
      onClick={() => {
        window.location.href = `https://base.${config.site.domain}`;
      }}
    />,
    <PolygonButton
      key="polygon"
      onClick={() => {
        window.location.href = `https://polygon.${config.site.domain}`;
      }}
    />,
  ];

  const CurrentNetworkButton = () => {
    switch (config.chain) {
      case 'mainnet':
        return <EthereumButton onClick={() => setShowNetworks(!showNetworks)} />;
      case 'base':
        return <BaseButton onClick={() => setShowNetworks(!showNetworks)} />;
      case 'polygon':
        return <PolygonButton onClick={() => setShowNetworks(!showNetworks)} />;
      default:
        return <Button disabled>Unknown Network</Button>;
    }
  };

  return (
    <div className="fixed top-0 z-20 w-full bg-zinc-900">
      {showNetworks && (
        <div
          className="absolute top-0 left-0 w-full h-svh"
          onClick={() => setShowNetworks(false)}
        ></div>
      )}
      <div className="h-24 flex items-center justify-between px-8 box-content border-b-2 border-zinc-800">
        <div className="my-4 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <CollectoorLogo />
          <div className="text-xl text-zinc-200">
            Collectoor<span className="text-zinc-400 text-xs mr-1"> (beta)</span>
          </div>
          <div className="bg-yellow-400 text-zinc-950 text-sm px-1 rounded-md font-bold">0 fee</div>
        </div>
        <div className="relative pl-8">
          <div className="cursor-pointer p-2 rounded">
            <CurrentNetworkButton />
          </div>

          {showNetworks && (
            <div className="absolute top-0 right-0 flex flex-col p-2 rounded bg-zinc-800">
              <CurrentNetworkButton />
              {NetworkButtons.filter((btn) => btn.key != config.chain).map(
                (NetworkButton) => NetworkButton,
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EthereumButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button onClick={onClick}>
      <div className="flex items-center gap-2">
        <div className="h-8 w-4 flex-shrink-0 flex justify-center py-2">
          <img src={ethereumLogo} />
        </div>
        <div>Ethereum</div>
      </div>
    </Button>
  );
}

function BaseButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button onClick={onClick}>
      <div className="flex items-center gap-2">
        <div className="h-8 w-4 flex-shrink-0 flex justify-center py-2">
          <img src={baseLogo} />
        </div>
        <div>Base</div>
      </div>
    </Button>
  );
}

function PolygonButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button onClick={onClick}>
      <div className="flex items-center gap-2">
        <div className="h-8 w-4a flex-shrink-0 flex justify-center py-2">
          <img src={polygonLogo} />
        </div>
        <div>Polygon</div>
      </div>
    </Button>
  );
}
