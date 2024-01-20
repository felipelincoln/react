import { mainnet, sepolia } from 'viem/chains';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function () {
  const { connect, isPending } = useConnect();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  let onClick = () => connect({ connector: injected(), chainId: mainnet.id });
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
