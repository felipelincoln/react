import './App.css';
import { WagmiConfig, createConfig, mainnet, useEnsName } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { useAccount } from 'wagmi';
import ConnectButton from './components/ConnectButton';

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

function Profile() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });

  if (isConnected) {
    return <div>{ensName ?? address}</div>;
  }
}

function App() {
  return (
    <WagmiConfig config={config}>
      <Profile />
      <ConnectButton />
      <p>User's nft list</p>
      <p>User's ETH balance list</p>
      <p>Button to create order</p>
      <br />
      <p>List of all orders</p>
    </WagmiConfig>
  );
}

export default App;
