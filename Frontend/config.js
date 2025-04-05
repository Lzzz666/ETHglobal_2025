import { http, createConfig } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { metaMask } from '@wagmi/connectors';

const polygonAmoy = {
  id: 80002,
  name: 'Polygon Amoy',
  network: 'polygon-amoy',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [`https://rpc-amoy.polygon.technology`],
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
    [polygonAmoy.id]: http(`https://rpc-amoy.polygon.technology`),
  },
});

export const supportedChains = [polygon, polygonAmoy];