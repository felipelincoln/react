import './App.css';
import {
  WagmiConfig,
  createConfig,
  mainnet,
  sepolia,
  useBalance,
  useContractWrite,
  useEnsName,
  useSignTypedData,
} from 'wagmi';
import { createPublicClient, http } from 'viem';
import { useAccount } from 'wagmi';
import ConnectButton from './components/ConnectButton';
import { useEffect, useState } from 'react';
import { MerkleTree } from 'merkletreejs';
import { keccak256 } from 'ethers'; // TODO: use viem instgead

const leaves = [101, 1, 2].map((x) => '0x' + x.toString(16).padStart(64, '0')).map(keccak256);
const tree = new MerkleTree(leaves, keccak256, { sort: true });
const root = tree.getHexRoot();
const proof = tree.getProof(leaves[0]).map((x) => '0x' + x.data.toString('hex'));

console.log({ root, proof });

const config = createConfig({
  autoConnect: true,
  publicClient: createPublicClient({
    chain: sepolia,
    transport: http(),
  }),
});

const contract = '0x960b7a6bcd451c9968473f7bbfd9be826efd549a';

const order = (_offerer: string, _tokenId: number) => {
  return {
    offerer: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
    zone: '0x0000000000000000000000000000000000000000',
    offer: [
      {
        itemType: '2',
        token: '0xe2210c9c305E0A18183bB8A0Bd694150203Bae2A',
        identifierOrCriteria: '100',
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
        recipient: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      },
      {
        itemType: '4',
        token: '0xe2210c9c305E0A18183bB8A0Bd694150203Bae2A',
        identifierOrCriteria: root,
        startAmount: '1',
        endAmount: '1',
        recipient: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
      },
    ],
    orderType: '0',
    startTime: '1693445130',
    endTime: '1996123530',
    zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    salt: '1000000001',
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
  const { data: signature, signTypedData, variables } = useSignTypedData();

  useEffect(() => {
    if (signature) {
      fetch('http://localhost:3000/order/create', {
        body: JSON.stringify({
          tokenId: parseInt((variables?.message.offer as any)[0].identifierOrCriteria),
          message: variables?.message,
          signature,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      console.log('order created!');
    }
  }, [signature]);

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
          domain: {
            chainId: 11155111,
            name: 'Seaport',
            version: '1.5',
            verifyingContract: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
          },
          message: order(address!, Number(nft.tokenId)),
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

function Orders() {
  const [orders, setOrders] = useState([]);
  const { isSuccess, write } = useContractWrite({
    functionName: 'fulfillAdvancedOrder',
    address: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
    abi,
  });

  console.log({ isSuccess });

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch('http://localhost:3000/orders');
      const { data } = await res.json();
      setOrders(data);
    };

    fetchOrders().catch(console.error);
  }, []);

  const writeContract = (order: any, signature: string) => {
    const offer = [
      [
        order.offer[0].itemType,
        order.offer[0].token,
        order.offer[0].identifierOrCriteria,
        order.offer[0].startAmount,
        order.offer[0].endAmount,
      ],
    ];

    const consideration = [
      [
        order.consideration[0].itemType,
        order.consideration[0].token,
        order.consideration[0].identifierOrCriteria,
        order.consideration[0].startAmount,
        order.consideration[0].endAmount,
        order.consideration[0].recipient,
      ],
      [
        order.consideration[1].itemType,
        order.consideration[1].token,
        order.consideration[1].identifierOrCriteria,
        order.consideration[1].startAmount,
        order.consideration[1].endAmount,
        order.consideration[1].recipient,
      ],
    ];

    const orderParameters = [
      order.offerer,
      order.zone,
      offer,
      consideration,
      order.orderType,
      order.startTime,
      order.endTime,
      order.zoneHash,
      order.salt,
      order.conduitKey,
      consideration.length,
    ];

    const advancedOrder = [orderParameters, 1, 1, signature, '0x'];

    // order index, side, index, identifier, proof
    const criteriaResolvers = [[0, 1, 1, 101, proof]];
    write({
      args: [
        advancedOrder,
        criteriaResolvers,
        order.conduitKey,
        '0x0000000000000000000000000000000000000000',
      ],
      value: 10000000000000000n,
    });

    // TODO: remove listing
  };

  const ordersLi = orders.map((order: any) => (
    <li key={order._id}>
      {order.order.message.offer[0].identifierOrCriteria} -{' '}
      {order.order.message.consideration[0].startAmount / 1e18} ETH{' '}
      <button onClick={() => writeContract(order.order.message, order.order.signature)}>Buy</button>
    </li>
  ));

  return (
    <>
      <ol>{ordersLi}</ol>
    </>
  );
}

function App() {
  return (
    <WagmiConfig config={config}>
      <Profile />
      <ConnectButton />
      <br />
      <Orders />
    </WagmiConfig>
  );
}

export default App;

const abi = [
  {
    inputs: [{ internalType: 'address', name: 'conduitController', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'BadContractSignature', type: 'error' },
  { inputs: [], name: 'BadFraction', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'BadReturnValueFromERC20OnTransfer',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint8', name: 'v', type: 'uint8' }],
    name: 'BadSignatureV',
    type: 'error',
  },
  { inputs: [], name: 'CannotCancelOrder', type: 'error' },
  { inputs: [], name: 'ConsiderationCriteriaResolverOutOfRange', type: 'error' },
  { inputs: [], name: 'ConsiderationLengthNotEqualToTotalOriginal', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'considerationIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'shortfallAmount', type: 'uint256' },
    ],
    name: 'ConsiderationNotMet',
    type: 'error',
  },
  { inputs: [], name: 'CriteriaNotEnabledForItem', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256[]', name: 'identifiers', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' },
    ],
    name: 'ERC1155BatchTransferGenericFailure',
    type: 'error',
  },
  { inputs: [], name: 'InexactFraction', type: 'error' },
  { inputs: [], name: 'InsufficientNativeTokensSupplied', type: 'error' },
  { inputs: [], name: 'Invalid1155BatchTransferEncoding', type: 'error' },
  { inputs: [], name: 'InvalidBasicOrderParameterEncoding', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'conduit', type: 'address' }],
    name: 'InvalidCallToConduit',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
      { internalType: 'address', name: 'conduit', type: 'address' },
    ],
    name: 'InvalidConduit',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'orderHash', type: 'bytes32' }],
    name: 'InvalidContractOrder',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'InvalidERC721TransferAmount',
    type: 'error',
  },
  { inputs: [], name: 'InvalidFulfillmentComponentData', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'value', type: 'uint256' }],
    name: 'InvalidMsgValue',
    type: 'error',
  },
  { inputs: [], name: 'InvalidNativeOfferItem', type: 'error' },
  { inputs: [], name: 'InvalidProof', type: 'error' },
  {
    inputs: [{ internalType: 'bytes32', name: 'orderHash', type: 'bytes32' }],
    name: 'InvalidRestrictedOrder',
    type: 'error',
  },
  { inputs: [], name: 'InvalidSignature', type: 'error' },
  { inputs: [], name: 'InvalidSigner', type: 'error' },
  {
    inputs: [
      { internalType: 'uint256', name: 'startTime', type: 'uint256' },
      { internalType: 'uint256', name: 'endTime', type: 'uint256' },
    ],
    name: 'InvalidTime',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'fulfillmentIndex', type: 'uint256' }],
    name: 'MismatchedFulfillmentOfferAndConsiderationComponents',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'enum Side', name: 'side', type: 'uint8' }],
    name: 'MissingFulfillmentComponentOnAggregation',
    type: 'error',
  },
  { inputs: [], name: 'MissingItemAmount', type: 'error' },
  { inputs: [], name: 'MissingOriginalConsiderationItems', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'NativeTokenTransferGenericFailure',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'NoContract',
    type: 'error',
  },
  { inputs: [], name: 'NoReentrantCalls', type: 'error' },
  { inputs: [], name: 'NoSpecifiedOrdersAvailable', type: 'error' },
  { inputs: [], name: 'OfferAndConsiderationRequiredOnFulfillment', type: 'error' },
  { inputs: [], name: 'OfferCriteriaResolverOutOfRange', type: 'error' },
  {
    inputs: [{ internalType: 'bytes32', name: 'orderHash', type: 'bytes32' }],
    name: 'OrderAlreadyFilled',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'enum Side', name: 'side', type: 'uint8' }],
    name: 'OrderCriteriaResolverOutOfRange',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'orderHash', type: 'bytes32' }],
    name: 'OrderIsCancelled',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'orderHash', type: 'bytes32' }],
    name: 'OrderPartiallyFilled',
    type: 'error',
  },
  { inputs: [], name: 'PartialFillsNotEnabledForOrder', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'from', type: 'address' },
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: 'uint256', name: 'identifier', type: 'uint256' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'TokenTransferGenericFailure',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'considerationIndex', type: 'uint256' },
    ],
    name: 'UnresolvedConsiderationCriteria',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
      { internalType: 'uint256', name: 'offerIndex', type: 'uint256' },
    ],
    name: 'UnresolvedOfferCriteria',
    type: 'error',
  },
  { inputs: [], name: 'UnusedItemParameters', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'uint256', name: 'newCounter', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'offerer', type: 'address' },
    ],
    name: 'CounterIncremented',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'orderHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'offerer', type: 'address' },
      { indexed: true, internalType: 'address', name: 'zone', type: 'address' },
    ],
    name: 'OrderCancelled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'orderHash', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'offerer', type: 'address' },
      { indexed: true, internalType: 'address', name: 'zone', type: 'address' },
      { indexed: false, internalType: 'address', name: 'recipient', type: 'address' },
      {
        components: [
          { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'uint256', name: 'identifier', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        indexed: false,
        internalType: 'struct SpentItem[]',
        name: 'offer',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'uint256', name: 'identifier', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'address payable', name: 'recipient', type: 'address' },
        ],
        indexed: false,
        internalType: 'struct ReceivedItem[]',
        name: 'consideration',
        type: 'tuple[]',
      },
    ],
    name: 'OrderFulfilled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: 'bytes32', name: 'orderHash', type: 'bytes32' },
      {
        components: [
          { internalType: 'address', name: 'offerer', type: 'address' },
          { internalType: 'address', name: 'zone', type: 'address' },
          {
            components: [
              { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
              { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
              { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
            ],
            internalType: 'struct OfferItem[]',
            name: 'offer',
            type: 'tuple[]',
          },
          {
            components: [
              { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
              { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
              { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
              { internalType: 'address payable', name: 'recipient', type: 'address' },
            ],
            internalType: 'struct ConsiderationItem[]',
            name: 'consideration',
            type: 'tuple[]',
          },
          { internalType: 'enum OrderType', name: 'orderType', type: 'uint8' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
          { internalType: 'uint256', name: 'totalOriginalConsiderationItems', type: 'uint256' },
        ],
        indexed: false,
        internalType: 'struct OrderParameters',
        name: 'orderParameters',
        type: 'tuple',
      },
    ],
    name: 'OrderValidated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'bytes32[]', name: 'orderHashes', type: 'bytes32[]' }],
    name: 'OrdersMatched',
    type: 'event',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'offerer', type: 'address' },
          { internalType: 'address', name: 'zone', type: 'address' },
          {
            components: [
              { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
              { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
              { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
            ],
            internalType: 'struct OfferItem[]',
            name: 'offer',
            type: 'tuple[]',
          },
          {
            components: [
              { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
              { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
              { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
              { internalType: 'address payable', name: 'recipient', type: 'address' },
            ],
            internalType: 'struct ConsiderationItem[]',
            name: 'consideration',
            type: 'tuple[]',
          },
          { internalType: 'enum OrderType', name: 'orderType', type: 'uint8' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
          { internalType: 'uint256', name: 'counter', type: 'uint256' },
        ],
        internalType: 'struct order[]',
        name: 'orders',
        type: 'tuple[]',
      },
    ],
    name: 'cancel',
    outputs: [{ internalType: 'bool', name: 'cancelled', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'offerer', type: 'address' },
              { internalType: 'address', name: 'zone', type: 'address' },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                ],
                internalType: 'struct OfferItem[]',
                name: 'offer',
                type: 'tuple[]',
              },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                  { internalType: 'address payable', name: 'recipient', type: 'address' },
                ],
                internalType: 'struct ConsiderationItem[]',
                name: 'consideration',
                type: 'tuple[]',
              },
              { internalType: 'enum OrderType', name: 'orderType', type: 'uint8' },
              { internalType: 'uint256', name: 'startTime', type: 'uint256' },
              { internalType: 'uint256', name: 'endTime', type: 'uint256' },
              { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
              { internalType: 'uint256', name: 'salt', type: 'uint256' },
              { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
              { internalType: 'uint256', name: 'totalOriginalConsiderationItems', type: 'uint256' },
            ],
            internalType: 'struct OrderParameters',
            name: 'parameters',
            type: 'tuple',
          },
          { internalType: 'uint120', name: 'numerator', type: 'uint120' },
          { internalType: 'uint120', name: 'denominator', type: 'uint120' },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
          { internalType: 'bytes', name: 'extraData', type: 'bytes' },
        ],
        internalType: 'struct AdvancedOrder',
        name: '',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
          { internalType: 'enum Side', name: 'side', type: 'uint8' },
          { internalType: 'uint256', name: 'index', type: 'uint256' },
          { internalType: 'uint256', name: 'identifier', type: 'uint256' },
          { internalType: 'bytes32[]', name: 'criteriaProof', type: 'bytes32[]' },
        ],
        internalType: 'struct CriteriaResolver[]',
        name: '',
        type: 'tuple[]',
      },
      { internalType: 'bytes32', name: 'fulfillerConduitKey', type: 'bytes32' },
      { internalType: 'address', name: 'recipient', type: 'address' },
    ],
    name: 'fulfillAdvancedOrder',
    outputs: [{ internalType: 'bool', name: 'fulfilled', type: 'bool' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'offerer', type: 'address' },
              { internalType: 'address', name: 'zone', type: 'address' },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                ],
                internalType: 'struct OfferItem[]',
                name: 'offer',
                type: 'tuple[]',
              },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                  { internalType: 'address payable', name: 'recipient', type: 'address' },
                ],
                internalType: 'struct ConsiderationItem[]',
                name: 'consideration',
                type: 'tuple[]',
              },
              { internalType: 'enum OrderType', name: 'orderType', type: 'uint8' },
              { internalType: 'uint256', name: 'startTime', type: 'uint256' },
              { internalType: 'uint256', name: 'endTime', type: 'uint256' },
              { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
              { internalType: 'uint256', name: 'salt', type: 'uint256' },
              { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
              { internalType: 'uint256', name: 'totalOriginalConsiderationItems', type: 'uint256' },
            ],
            internalType: 'struct OrderParameters',
            name: 'parameters',
            type: 'tuple',
          },
          { internalType: 'uint120', name: 'numerator', type: 'uint120' },
          { internalType: 'uint120', name: 'denominator', type: 'uint120' },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
          { internalType: 'bytes', name: 'extraData', type: 'bytes' },
        ],
        internalType: 'struct AdvancedOrder[]',
        name: '',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
          { internalType: 'enum Side', name: 'side', type: 'uint8' },
          { internalType: 'uint256', name: 'index', type: 'uint256' },
          { internalType: 'uint256', name: 'identifier', type: 'uint256' },
          { internalType: 'bytes32[]', name: 'criteriaProof', type: 'bytes32[]' },
        ],
        internalType: 'struct CriteriaResolver[]',
        name: '',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'itemIndex', type: 'uint256' },
        ],
        internalType: 'struct FulfillmentComponent[][]',
        name: '',
        type: 'tuple[][]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'itemIndex', type: 'uint256' },
        ],
        internalType: 'struct FulfillmentComponent[][]',
        name: '',
        type: 'tuple[][]',
      },
      { internalType: 'bytes32', name: 'fulfillerConduitKey', type: 'bytes32' },
      { internalType: 'address', name: 'recipient', type: 'address' },
      { internalType: 'uint256', name: 'maximumFulfilled', type: 'uint256' },
    ],
    name: 'fulfillAvailableAdvancedOrders',
    outputs: [
      { internalType: 'bool[]', name: '', type: 'bool[]' },
      {
        components: [
          {
            components: [
              { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'identifier', type: 'uint256' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              { internalType: 'address payable', name: 'recipient', type: 'address' },
            ],
            internalType: 'struct ReceivedItem',
            name: 'item',
            type: 'tuple',
          },
          { internalType: 'address', name: 'offerer', type: 'address' },
          { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
        ],
        internalType: 'struct Execution[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'offerer', type: 'address' },
              { internalType: 'address', name: 'zone', type: 'address' },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                ],
                internalType: 'struct OfferItem[]',
                name: 'offer',
                type: 'tuple[]',
              },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                  { internalType: 'address payable', name: 'recipient', type: 'address' },
                ],
                internalType: 'struct ConsiderationItem[]',
                name: 'consideration',
                type: 'tuple[]',
              },
              { internalType: 'enum OrderType', name: 'orderType', type: 'uint8' },
              { internalType: 'uint256', name: 'startTime', type: 'uint256' },
              { internalType: 'uint256', name: 'endTime', type: 'uint256' },
              { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
              { internalType: 'uint256', name: 'salt', type: 'uint256' },
              { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
              { internalType: 'uint256', name: 'totalOriginalConsiderationItems', type: 'uint256' },
            ],
            internalType: 'struct OrderParameters',
            name: 'parameters',
            type: 'tuple',
          },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct Order[]',
        name: '',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'itemIndex', type: 'uint256' },
        ],
        internalType: 'struct FulfillmentComponent[][]',
        name: '',
        type: 'tuple[][]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
          { internalType: 'uint256', name: 'itemIndex', type: 'uint256' },
        ],
        internalType: 'struct FulfillmentComponent[][]',
        name: '',
        type: 'tuple[][]',
      },
      { internalType: 'bytes32', name: 'fulfillerConduitKey', type: 'bytes32' },
      { internalType: 'uint256', name: 'maximumFulfilled', type: 'uint256' },
    ],
    name: 'fulfillAvailableOrders',
    outputs: [
      { internalType: 'bool[]', name: '', type: 'bool[]' },
      {
        components: [
          {
            components: [
              { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'identifier', type: 'uint256' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              { internalType: 'address payable', name: 'recipient', type: 'address' },
            ],
            internalType: 'struct ReceivedItem',
            name: 'item',
            type: 'tuple',
          },
          { internalType: 'address', name: 'offerer', type: 'address' },
          { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
        ],
        internalType: 'struct Execution[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'considerationToken', type: 'address' },
          { internalType: 'uint256', name: 'considerationIdentifier', type: 'uint256' },
          { internalType: 'uint256', name: 'considerationAmount', type: 'uint256' },
          { internalType: 'address payable', name: 'offerer', type: 'address' },
          { internalType: 'address', name: 'zone', type: 'address' },
          { internalType: 'address', name: 'offerToken', type: 'address' },
          { internalType: 'uint256', name: 'offerIdentifier', type: 'uint256' },
          { internalType: 'uint256', name: 'offerAmount', type: 'uint256' },
          { internalType: 'enum BasicOrderType', name: 'basicOrderType', type: 'uint8' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'bytes32', name: 'offererConduitKey', type: 'bytes32' },
          { internalType: 'bytes32', name: 'fulfillerConduitKey', type: 'bytes32' },
          { internalType: 'uint256', name: 'totalOriginalAdditionalRecipients', type: 'uint256' },
          {
            components: [
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              { internalType: 'address payable', name: 'recipient', type: 'address' },
            ],
            internalType: 'struct AdditionalRecipient[]',
            name: 'additionalRecipients',
            type: 'tuple[]',
          },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct BasicOrderParameters',
        name: 'parameters',
        type: 'tuple',
      },
    ],
    name: 'fulfillBasicOrder',
    outputs: [{ internalType: 'bool', name: 'fulfilled', type: 'bool' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'considerationToken', type: 'address' },
          { internalType: 'uint256', name: 'considerationIdentifier', type: 'uint256' },
          { internalType: 'uint256', name: 'considerationAmount', type: 'uint256' },
          { internalType: 'address payable', name: 'offerer', type: 'address' },
          { internalType: 'address', name: 'zone', type: 'address' },
          { internalType: 'address', name: 'offerToken', type: 'address' },
          { internalType: 'uint256', name: 'offerIdentifier', type: 'uint256' },
          { internalType: 'uint256', name: 'offerAmount', type: 'uint256' },
          { internalType: 'enum BasicOrderType', name: 'basicOrderType', type: 'uint8' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'bytes32', name: 'offererConduitKey', type: 'bytes32' },
          { internalType: 'bytes32', name: 'fulfillerConduitKey', type: 'bytes32' },
          { internalType: 'uint256', name: 'totalOriginalAdditionalRecipients', type: 'uint256' },
          {
            components: [
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              { internalType: 'address payable', name: 'recipient', type: 'address' },
            ],
            internalType: 'struct AdditionalRecipient[]',
            name: 'additionalRecipients',
            type: 'tuple[]',
          },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct BasicOrderParameters',
        name: 'parameters',
        type: 'tuple',
      },
    ],
    name: 'fulfillBasicOrder_efficient_6GL6yc',
    outputs: [{ internalType: 'bool', name: 'fulfilled', type: 'bool' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'offerer', type: 'address' },
              { internalType: 'address', name: 'zone', type: 'address' },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                ],
                internalType: 'struct OfferItem[]',
                name: 'offer',
                type: 'tuple[]',
              },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                  { internalType: 'address payable', name: 'recipient', type: 'address' },
                ],
                internalType: 'struct ConsiderationItem[]',
                name: 'consideration',
                type: 'tuple[]',
              },
              { internalType: 'enum OrderType', name: 'orderType', type: 'uint8' },
              { internalType: 'uint256', name: 'startTime', type: 'uint256' },
              { internalType: 'uint256', name: 'endTime', type: 'uint256' },
              { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
              { internalType: 'uint256', name: 'salt', type: 'uint256' },
              { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
              { internalType: 'uint256', name: 'totalOriginalConsiderationItems', type: 'uint256' },
            ],
            internalType: 'struct OrderParameters',
            name: 'parameters',
            type: 'tuple',
          },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct Order',
        name: '',
        type: 'tuple',
      },
      { internalType: 'bytes32', name: 'fulfillerConduitKey', type: 'bytes32' },
    ],
    name: 'fulfillOrder',
    outputs: [{ internalType: 'bool', name: 'fulfilled', type: 'bool' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'contractOfferer', type: 'address' }],
    name: 'getContractOffererNonce',
    outputs: [{ internalType: 'uint256', name: 'nonce', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'offerer', type: 'address' }],
    name: 'getCounter',
    outputs: [{ internalType: 'uint256', name: 'counter', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'offerer', type: 'address' },
          { internalType: 'address', name: 'zone', type: 'address' },
          {
            components: [
              { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
              { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
              { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
            ],
            internalType: 'struct OfferItem[]',
            name: 'offer',
            type: 'tuple[]',
          },
          {
            components: [
              { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
              { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
              { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
              { internalType: 'address payable', name: 'recipient', type: 'address' },
            ],
            internalType: 'struct ConsiderationItem[]',
            name: 'consideration',
            type: 'tuple[]',
          },
          { internalType: 'enum OrderType', name: 'orderType', type: 'uint8' },
          { internalType: 'uint256', name: 'startTime', type: 'uint256' },
          { internalType: 'uint256', name: 'endTime', type: 'uint256' },
          { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
          { internalType: 'uint256', name: 'salt', type: 'uint256' },
          { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
          { internalType: 'uint256', name: 'counter', type: 'uint256' },
        ],
        internalType: 'struct order',
        name: '',
        type: 'tuple',
      },
    ],
    name: 'getOrderHash',
    outputs: [{ internalType: 'bytes32', name: 'orderHash', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'orderHash', type: 'bytes32' }],
    name: 'getOrderStatus',
    outputs: [
      { internalType: 'bool', name: 'isValidated', type: 'bool' },
      { internalType: 'bool', name: 'isCancelled', type: 'bool' },
      { internalType: 'uint256', name: 'totalFilled', type: 'uint256' },
      { internalType: 'uint256', name: 'totalSize', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'incrementCounter',
    outputs: [{ internalType: 'uint256', name: 'newCounter', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'information',
    outputs: [
      { internalType: 'string', name: 'version', type: 'string' },
      { internalType: 'bytes32', name: 'domainSeparator', type: 'bytes32' },
      { internalType: 'address', name: 'conduitController', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'offerer', type: 'address' },
              { internalType: 'address', name: 'zone', type: 'address' },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                ],
                internalType: 'struct OfferItem[]',
                name: 'offer',
                type: 'tuple[]',
              },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                  { internalType: 'address payable', name: 'recipient', type: 'address' },
                ],
                internalType: 'struct ConsiderationItem[]',
                name: 'consideration',
                type: 'tuple[]',
              },
              { internalType: 'enum OrderType', name: 'orderType', type: 'uint8' },
              { internalType: 'uint256', name: 'startTime', type: 'uint256' },
              { internalType: 'uint256', name: 'endTime', type: 'uint256' },
              { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
              { internalType: 'uint256', name: 'salt', type: 'uint256' },
              { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
              { internalType: 'uint256', name: 'totalOriginalConsiderationItems', type: 'uint256' },
            ],
            internalType: 'struct OrderParameters',
            name: 'parameters',
            type: 'tuple',
          },
          { internalType: 'uint120', name: 'numerator', type: 'uint120' },
          { internalType: 'uint120', name: 'denominator', type: 'uint120' },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
          { internalType: 'bytes', name: 'extraData', type: 'bytes' },
        ],
        internalType: 'struct AdvancedOrder[]',
        name: '',
        type: 'tuple[]',
      },
      {
        components: [
          { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
          { internalType: 'enum Side', name: 'side', type: 'uint8' },
          { internalType: 'uint256', name: 'index', type: 'uint256' },
          { internalType: 'uint256', name: 'identifier', type: 'uint256' },
          { internalType: 'bytes32[]', name: 'criteriaProof', type: 'bytes32[]' },
        ],
        internalType: 'struct CriteriaResolver[]',
        name: '',
        type: 'tuple[]',
      },
      {
        components: [
          {
            components: [
              { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
              { internalType: 'uint256', name: 'itemIndex', type: 'uint256' },
            ],
            internalType: 'struct FulfillmentComponent[]',
            name: 'offerComponents',
            type: 'tuple[]',
          },
          {
            components: [
              { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
              { internalType: 'uint256', name: 'itemIndex', type: 'uint256' },
            ],
            internalType: 'struct FulfillmentComponent[]',
            name: 'considerationComponents',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct Fulfillment[]',
        name: '',
        type: 'tuple[]',
      },
      { internalType: 'address', name: 'recipient', type: 'address' },
    ],
    name: 'matchAdvancedOrders',
    outputs: [
      {
        components: [
          {
            components: [
              { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'identifier', type: 'uint256' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              { internalType: 'address payable', name: 'recipient', type: 'address' },
            ],
            internalType: 'struct ReceivedItem',
            name: 'item',
            type: 'tuple',
          },
          { internalType: 'address', name: 'offerer', type: 'address' },
          { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
        ],
        internalType: 'struct Execution[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'offerer', type: 'address' },
              { internalType: 'address', name: 'zone', type: 'address' },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                ],
                internalType: 'struct OfferItem[]',
                name: 'offer',
                type: 'tuple[]',
              },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                  { internalType: 'address payable', name: 'recipient', type: 'address' },
                ],
                internalType: 'struct ConsiderationItem[]',
                name: 'consideration',
                type: 'tuple[]',
              },
              { internalType: 'enum OrderType', name: 'orderType', type: 'uint8' },
              { internalType: 'uint256', name: 'startTime', type: 'uint256' },
              { internalType: 'uint256', name: 'endTime', type: 'uint256' },
              { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
              { internalType: 'uint256', name: 'salt', type: 'uint256' },
              { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
              { internalType: 'uint256', name: 'totalOriginalConsiderationItems', type: 'uint256' },
            ],
            internalType: 'struct OrderParameters',
            name: 'parameters',
            type: 'tuple',
          },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct Order[]',
        name: '',
        type: 'tuple[]',
      },
      {
        components: [
          {
            components: [
              { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
              { internalType: 'uint256', name: 'itemIndex', type: 'uint256' },
            ],
            internalType: 'struct FulfillmentComponent[]',
            name: 'offerComponents',
            type: 'tuple[]',
          },
          {
            components: [
              { internalType: 'uint256', name: 'orderIndex', type: 'uint256' },
              { internalType: 'uint256', name: 'itemIndex', type: 'uint256' },
            ],
            internalType: 'struct FulfillmentComponent[]',
            name: 'considerationComponents',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct Fulfillment[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    name: 'matchOrders',
    outputs: [
      {
        components: [
          {
            components: [
              { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'identifier', type: 'uint256' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
              { internalType: 'address payable', name: 'recipient', type: 'address' },
            ],
            internalType: 'struct ReceivedItem',
            name: 'item',
            type: 'tuple',
          },
          { internalType: 'address', name: 'offerer', type: 'address' },
          { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
        ],
        internalType: 'struct Execution[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: 'address', name: 'offerer', type: 'address' },
              { internalType: 'address', name: 'zone', type: 'address' },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                ],
                internalType: 'struct OfferItem[]',
                name: 'offer',
                type: 'tuple[]',
              },
              {
                components: [
                  { internalType: 'enum ItemType', name: 'itemType', type: 'uint8' },
                  { internalType: 'address', name: 'token', type: 'address' },
                  { internalType: 'uint256', name: 'identifierOrCriteria', type: 'uint256' },
                  { internalType: 'uint256', name: 'startAmount', type: 'uint256' },
                  { internalType: 'uint256', name: 'endAmount', type: 'uint256' },
                  { internalType: 'address payable', name: 'recipient', type: 'address' },
                ],
                internalType: 'struct ConsiderationItem[]',
                name: 'consideration',
                type: 'tuple[]',
              },
              { internalType: 'enum OrderType', name: 'orderType', type: 'uint8' },
              { internalType: 'uint256', name: 'startTime', type: 'uint256' },
              { internalType: 'uint256', name: 'endTime', type: 'uint256' },
              { internalType: 'bytes32', name: 'zoneHash', type: 'bytes32' },
              { internalType: 'uint256', name: 'salt', type: 'uint256' },
              { internalType: 'bytes32', name: 'conduitKey', type: 'bytes32' },
              { internalType: 'uint256', name: 'totalOriginalConsiderationItems', type: 'uint256' },
            ],
            internalType: 'struct OrderParameters',
            name: 'parameters',
            type: 'tuple',
          },
          { internalType: 'bytes', name: 'signature', type: 'bytes' },
        ],
        internalType: 'struct Order[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    name: 'validate',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
];
