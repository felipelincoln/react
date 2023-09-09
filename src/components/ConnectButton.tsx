import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

function ConnectButton() {
  const { connect, isLoading } = useConnect({
    chainId: 1,
    connector: new InjectedConnector(),
  });

  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  let onClick = () => connect();
  let value = 'Connect';
  const options = { disabled: false };

  if (isLoading) {
    onClick = () => {};
    value = 'Loading...';
    options.disabled = true;
  }
  if (isConnected) {
    onClick = () => disconnect();
    value = 'Disconnect';
  }

  return (
    <>
      <button onClick={onClick} disabled={options.disabled}>
        {value}
      </button>
    </>
  );
}

export default ConnectButton;
