import { mainnet } from 'viem/chains';

export const config = {
  api: {
    url: 'https://api.collectoor.com',
  },
  web3: {
    chain: mainnet,
    rpc: 'https://api.collectoor.com/jsonrpc',
    seaport: {
      name: 'Seaport',
      version: '1.6',
      contract: '0x0000000000000068F116a894984e2DB1123eB395' as `0x${string}`,
      zone: '0x004C00500000aD104D7DBd00e3ae0A5C00560C00',
      zoneHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      conduit: '0x1e0049783f008a0085193e00003d00cd54003c71' as `0x${string}`,
      conduitKey: '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000',
      startTime: '0',
    },
  },
  fee: {
    recipient: '0x88FE6ED81c6fb5620265B227574ea8e0C8d08E9c',
    amount: '5000000000000000', // 0.005 ETH
  },
};
