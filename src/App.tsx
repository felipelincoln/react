import './App.css';
import { WagmiConfig, createConfig, mainnet, useBalance, useEnsName } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { useAccount } from 'wagmi';
import ConnectButton from './components/ConnectButton';
import { useEffect, useState } from 'react';

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: mainnet,
    transport: http(),
  }),
});

interface NFT {
  tokenId: string;
  thumbnail?: string;
}

function Profile() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [nfts, setNfts] = useState<NFT[]>([]);
  const { data: balance } = useBalance({ address });

  useEffect(() => {
    if (!address) return;

    fetch('http://localhost:3000/nfts/0x960b7a6bcd451c9968473f7bbfd9be826efd549a/' + address).then(
      (res) => res.json().then(({ data }) => setNfts(data)),
    );
  }, [address]);

  const listNfts = nfts.map((nft) => <img src={nft.thumbnail} alt={nft.tokenId} />);

  if (isConnected) {
    return (
      <>
        <div>{ensName ?? address}</div>
        <div>{balance?.formatted ?? 0} ETH</div>
        <div>{listNfts}</div>
      </>
    );
  }
}

function App() {
  return (
    <WagmiConfig config={config}>
      <Profile />
      <ConnectButton />
      <p>Button to create order</p>
      <br />
      <p>List of all orders</p>
    </WagmiConfig>
  );
}

export default App;
