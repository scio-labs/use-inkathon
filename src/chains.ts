import { SubstrateChain, SubstrateExplorer } from '@/types'

/**
 * Local Development Network
 */

export const development: SubstrateChain = {
  network: 'development',
  name: 'Local Development',
  ss58Prefix: 42,
  rpcUrls: ['ws://127.0.0.1:9944'],
  explorerUrls: {
    [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
      'ws://127.0.0.1:9944',
    )}/#/explorer`,
  },
  testnet: true,
  faucetUrls: ['https://polkadot.js.org/apps/#/accounts?rpc=ws://127.0.0.1:9944'],
}

/**
 * Live Testnets
 */

export const alephzeroTestnet: SubstrateChain = {
  network: 'alephzero-testnet',
  name: 'Aleph Zero Testnet',
  ss58Prefix: 42,
  rpcUrls: ['wss://ws.test.azero.dev'],
  explorerUrls: {
    [SubstrateExplorer.PolkadotJs]: `https://test.azero.dev/?rpc=${encodeURIComponent(
      'wss://ws.test.azero.dev',
    )}/#/explorer`,
  },
  testnet: true,
  faucetUrls: ['https://faucet.test.azero.dev'],
}

export const rococo: SubstrateChain = {
  network: 'rococo',
  name: 'Rococo Contracts Testnet',
  ss58Prefix: 42,
  rpcUrls: ['wss://rococo-contracts-rpc.polkadot.io'],
  explorerUrls: {
    [SubstrateExplorer.Subscan]: `https://rococo.subscan.io`,
  },
  testnet: true,
  faucetUrls: ['https://matrix.to/#/#rococo-faucet:matrix.org'],
}

export const shibuya: SubstrateChain = {
  network: 'shibuya',
  name: 'Shibuya Testnet',
  ss58Prefix: 5,
  rpcUrls: ['wss://shibuya-rpc.dwellir.com'],
  explorerUrls: {
    [SubstrateExplorer.Subscan]: `https://shibuya.subscan.io`,
  },
  testnet: true,
  faucetUrls: ['https://portal.astar.network/#/shibuya-testnet/assets'],
}

export const t0rnTestnet: SubstrateChain = {
  network: 't0rn',
  name: 'T0rn Testnet',
  ss58Prefix: 42,
  rpcUrls: ['wss://ws.t0rn.io'],
  explorerUrls: {
    [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
      'wss://ws.t0rn.io',
    )}/#/explorer`,
  },
  testnet: true,
  faucetUrls: ['https://faucet.t0rn.io'],
}

export const bitCountryAlphaTestnet: SubstrateChain = {
  network: 'bitcountry-alpha-testnet',
  name: 'Bit.Country Alpha Testnet',
  ss58Prefix: 268,
  rpcUrls: ['wss://alphanet-rpc-gcp.bit.country'],
  explorerUrls: {
    [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
      'wss://alphanet-rpc-gcp.bit.country',
    )}#/explorer`,
  },
  testnet: true,
  faucetUrls: ['https://testnet.bit.country/p/wallet/balance'],
}

export const agungTestnet: SubstrateChain = {
  network: 'agung-testnet',
  name: 'Agung Testnet',
  ss58Prefix: 42,
  rpcUrls: ['wss://wss.agung.peaq.network'],
  explorerUrls: {
    [SubstrateExplorer.Subscan]: `https://agung-testnet.subscan.io/`,
    [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
      'wss://wss.agung.peaq.network',
    )}/#/explorer`,
  },
  testnet: true,
  faucetUrls: ['https://discord.com/channels/943486047625572392/963415793394143232'],
}

export const amplitudeTestnet: SubstrateChain = {
  network: 'amplitude-testnet',
  name: 'Amplitude Testnet',
  ss58Prefix: 57,
  rpcUrls: ['wss://pencol-roc-00.pendulumchain.tech'],
  explorerUrls: {
    [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
      'wss://pencol-roc-00.pendulumchain.tech',
    )}/#/explorer`,
  },
  testnet: true,
  faucetUrls: [],
}

export const phalaPOC5Testnet: SubstrateChain = {
  network: 'phala-PoC-5-testnet',
  name: 'Phala PoC-5 Testnet',
  ss58Prefix: 30,
  rpcUrls: ['wss://poc5.phala.network/ws'],
  explorerUrls: {
    [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
      'wss://poc5.phala.network/ws',
    )}#/explorer`,
  },
  testnet: true,
  faucetUrls: [],
}

/**
 * Live Canary Networks
 */

export const shiden: SubstrateChain = {
  network: 'shiden',
  name: 'Shiden',
  ss58Prefix: 5,
  rpcUrls: ['wss://shiden-rpc.dwellir.com'],
  explorerUrls: {
    [SubstrateExplorer.Subscan]: `https://shiden.subscan.io`,
  },
}

export const amplitude: SubstrateChain = {
  network: 'amplitude',
  name: 'Amplitude',
  ss58Prefix: 57,
  rpcUrls: ['wss://rpc-amplitude.pendulumchain.tech', 'wss://amplitude-rpc.dwellir.com'],
  explorerUrls: {
    [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
      'wss://rpc-amplitude.pendulumchain.tech',
    )}#/explorer`,
  },
}

export const khala: SubstrateChain = {
  network: 'khala',
  name: 'Khala',
  ss58Prefix: 30,
  rpcUrls: [
    'wss://khala-api.phala.network/ws',
    'wss://khala.api.onfinality.io/public-ws',
    'wss://khala-rpc.dwellir.com',
    'wss://public-rpc.pinknode.io/khala',
  ],
  explorerUrls: {
    [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
      'wss://khala-api.phala.network/ws',
    )}#/explorer`,
    [SubstrateExplorer.Subscan]: `https://khala.subscan.io`,
  },
}

/**
 * Live Mainnet Networks
 */

export const alephzero: SubstrateChain = {
  network: 'alephzero',
  name: 'Aleph Zero',
  ss58Prefix: 42,
  rpcUrls: ['wss://ws.azero.dev'],
  explorerUrls: {
    [SubstrateExplorer.Subscan]: `https://alephzero.subscan.io`,
    [SubstrateExplorer.PolkadotJs]: `https://azero.dev/?rpc=${encodeURIComponent(
      'wss://ws.azero.dev',
    )}/#/explorer`,
  },
}

export const astar: SubstrateChain = {
  network: 'astar',
  name: 'Astar',
  ss58Prefix: 5,
  rpcUrls: ['wss://astar-rpc.dwellir.com'],
  explorerUrls: {
    [SubstrateExplorer.Subscan]: `https://astar.subscan.io`,
  },
}

export const pendulum: SubstrateChain = {
  network: 'pendulum',
  name: 'Pendulum',
  ss58Prefix: 56,
  rpcUrls: ['wss://rpc-pendulum.prd.pendulumchain.tech', 'wss://pendulum-rpc.dwellir.com'],
  explorerUrls: {
    [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
      'wss://rpc-pendulum.prd.pendulumchain.tech',
    )}#/explorer`,
  },
}

export const phala: SubstrateChain = {
  network: 'phala',
  name: 'Phala',
  ss58Prefix: 30,
  rpcUrls: ['wss://api.phala.network/ws', 'wss://phala.api.onfinality.io/public-ws'],
  explorerUrls: {
    [SubstrateExplorer.PolkadotJs]: `https://polkadot.js.org/apps/?rpc=${encodeURIComponent(
      'wss://api.phala.network/ws',
    )}#/explorer`,
    [SubstrateExplorer.Subscan]: `https://phala.subscan.io`,
  },
}

/**
 * Exporting all chains separately
 */
export const allSubstrateChains: SubstrateChain[] = [
  development,
  alephzeroTestnet,
  rococo,
  t0rnTestnet,
  bitCountryAlphaTestnet,
  agungTestnet,
  amplitudeTestnet,
  phalaPOC5Testnet,
  shibuya,
  shiden,
  amplitude,
  khala,
  alephzero,
  astar,
  pendulum,
  phala,
]

/**
 * Returns chain (if existent) for given identifier (`network` field).
 */
export const getSubstrateChain = (networkId?: string): SubstrateChain | undefined => {
  return allSubstrateChains.find(
    (chain) => chain.network.toLowerCase() === (networkId || '').toLowerCase(),
  )
}
