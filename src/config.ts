export enum EthereumNetwork {
  Mainnet = '1',
  Sepolia = '11155111',
}

const ethereumNetwork = EthereumNetwork.Mainnet;
const explorer = 'https://etherscan.io';

//

export const config = {
  ethereumNetwork,
  explorer,
  fee: {
    recipient: '0x9F1063848b32D7c28C4144c8Eb81B6597C8f961D',
    amount: '5000000000000000', // 0.005 ETH
  },
};
