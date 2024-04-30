import { mainnet } from 'viem/chains';

export const config = {
  api: {
    url: 'http://localhost:3000',
  },
  eth: {
    chain: mainnet,
    rpc: 'http://localhost:3000/jsonrpc',
  },
  fee: {
    recipient: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
    amount: '5000000000000000', // 0.005 ETH
  },
};
