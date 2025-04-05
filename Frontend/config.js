import { http, createConfig } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { metaMask } from '@wagmi/connectors';

const polygonAmoy = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon-amoy',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [`https://polygon-amoy.g.alchemy.com/v2/sCFum5qcFFWmP3SwpXCLp5mwwgMs0zUr`],
    },
  },
  blockExplorers: {
    default: {
      name: 'PolygonScan',
      url: 'https://amoy.polygonscan.com',
    },
  },
  testnet: true,
};

export const config = createConfig({
  chains: [polygon, polygonAmoy],
  connectors: [
    metaMask({
      dappMetadata: {
        name: 'Your DApp Name',
      },
    }),
  ],
  transports: {
    [polygon.id]: http('https://polygon-rpc.com'),
    [polygonAmoy.id]: http(`https://polygon-amoy.g.alchemy.com/v2/sCFum5qcFFWmP3SwpXCLp5mwwgMs0zUr`),
  },
});

export const supportedChains = [polygon, polygonAmoy];