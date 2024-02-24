import { mainnet, sepolia } from 'viem/chains';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { EthereumNetwork, config } from '../../config';

export default function () {
  const { connect, isPending } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const chainId = (() => {
    switch (config.ethereumNetwork) {
      case EthereumNetwork.Mainnet:
        return mainnet.id;
      case EthereumNetwork.Sepolia:
        return sepolia.id;
      default:
        throw new Error(`Invalid Ethereum Network: ${config.ethereumNetwork}`);
    }
  })();

  let onClick = () => connect({ connector: injected(), chainId });

  let value = 'Connect';
  let disabled = false;

  if (isPending) {
    onClick = () => {};
    value = 'Pending...';
    disabled = true;
  }
  if (isConnected) {
    onClick = () => disconnect();
    value = 'Disconnect';
  }

  return (
    <>
      <button onClick={onClick} disabled={disabled}>
        {value}
      </button>
    </>
  );
}
