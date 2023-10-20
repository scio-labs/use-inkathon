/**
 * Substrate Chain Type
 */
export interface SubstrateChain {
  network: string
  name: string
  rpcUrls: [string, ...string[]]
  ss58Prefix?: number
  explorerUrls?: Partial<Record<SubstrateExplorer, string>>
  testnet?: boolean
  faucetUrls?: string[]
}

export enum SubstrateExplorer {
  Subscan = 'subscan',
  PolkadotJs = 'polkadotjs',
}

/**
 * Defined Substrate Chain Constants
 */

/// Local Development Network
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

/// Testnets

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
  name: 'Rococo',
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

/// Canary Networks (Kusama)

export const shiden: SubstrateChain = {
  network: 'shiden',
  name: 'Shiden',
  ss58Prefix: 5,
  rpcUrls: ['wss://shiden-rpc.dwellir.com'],
  explorerUrls: {
    [SubstrateExplorer.Subscan]: `https://shiden.subscan.io`,
  },
}

/// Mainnets

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
  faucetUrls: [],
}

/**
 * Exporting all chains separately
 */
export const allSubstrateChains: SubstrateChain[] = [
  development,
  alephzeroTestnet,
  rococo,
  shibuya,
  shiden,
  alephzero,
  astar,
]

/**
 * Returns chain (if existent) for given identifier (`network` field).
 */
export const getSubstrateChain = (networkId?: string): SubstrateChain | undefined => {
  return allSubstrateChains.find(
    (chain) => chain.network.toLowerCase() === (networkId || '').toLowerCase(),
  )
}
