import './App.css';
import {
  WagmiConfig,
  createConfig,
  mainnet,
  useBalance,
  useEnsName,
  useSignTypedData,
} from 'wagmi';
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

const contract = '0x960b7a6bcd451c9968473f7bbfd9be826efd549a';

const orderComponents = (offerer: string, tokenId: number) => {
  return {
    offerer,
    zone: '0x0000000000000000000000000000000000000000',
    offer: [
      {
        itemType: '2',
        token: '0xe2210c9c305E0A18183bB8A0Bd694150203Bae2A',
        identifierOrCriteria: tokenId.toString(),
        startAmount: '1',
        endAmount: '1',
      },
    ],
    consideration: [
      {
        itemType: '0',
        token: '0x0000000000000000000000000000000000000000',
        identifierOrCriteria: '0',
        startAmount: '10000000000000000',
        endAmount: '10000000000000000',
        recipient: offerer,
      },
      {
        itemType: '4',
        token: '0xe2210c9c305E0A18183bB8A0Bd694150203Bae2A',
        identifierOrCriteria: '0xfa9cbf111c604544050ae40133299366432e81ee19228ce2b7126adacf00bfc1',
        startAmount: '1',
        endAmount: '1',
        recipient: offerer,
      },
    ],
    orderType: '0',
    startTime: '1693445130',
    endTime: '1696123530',
    zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    salt: '1000000000',
    conduitKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
    counter: '0',
  };
};

interface NFT {
  tokenId: string;
  thumbnail?: string;
}

function Profile() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [nfts, setNfts] = useState<NFT[]>([]);
  const { data: balance } = useBalance({ address });
  const { data: signedMessage, signTypedData } = useSignTypedData();

  if (signedMessage) {
    fetch('http://localhost:3000/order/create', {
      body: JSON.stringify({ tokenId: 1 }),
      method: 'POST',
    });
  }

  useEffect(() => {
    if (!address) {
      setNfts([]);
      return;
    }

    fetch(`http://localhost:3000/nfts/${contract}/${address}`).then((res) =>
      res.json().then(({ data }) => setNfts(data)),
    );
  }, [address]);

  const listNfts = nfts.map((nft) => (
    <img
      onClick={() => {
        signTypedData({
          domain: { chainId: 1, name: 'Seaport' },
          message: orderComponents(contract, Number(nft.tokenId)),
          primaryType: 'OrderComponents',
          types: {
            OrderComponents: [
              { name: 'offerer', type: 'address' },
              { name: 'zone', type: 'address' },
              { name: 'offer', type: 'OfferItem[]' },
              { name: 'consideration', type: 'ConsiderationItem[]' },
              { name: 'orderType', type: 'uint8' },
              { name: 'startTime', type: 'uint256' },
              { name: 'endTime', type: 'uint256' },
              { name: 'zoneHash', type: 'bytes32' },
              { name: 'salt', type: 'uint256' },
              { name: 'conduitKey', type: 'bytes32' },
              { name: 'counter', type: 'uint256' },
            ],
            OfferItem: [
              { name: 'itemType', type: 'uint8' },
              { name: 'token', type: 'address' },
              { name: 'identifierOrCriteria', type: 'uint256' },
              { name: 'startAmount', type: 'uint256' },
              { name: 'endAmount', type: 'uint256' },
            ],
            ConsiderationItem: [
              { name: 'itemType', type: 'uint8' },
              { name: 'token', type: 'address' },
              { name: 'identifierOrCriteria', type: 'uint256' },
              { name: 'startAmount', type: 'uint256' },
              { name: 'endAmount', type: 'uint256' },
              { name: 'recipient', type: 'address' },
            ],
          },
        });
        const signature = signedMessage;
        console.log({ signature });
      }}
      src={nft.thumbnail}
      key={nft.tokenId}
      alt={nft.tokenId}
    />
  ));

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
      <br />
      <p>List of all orders</p>
      <p>button Fulfill order</p>
    </WagmiConfig>
  );
}

export default App;
