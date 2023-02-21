/**
 * Substrate Chain Type
 */
export interface SubstrateChain {
  network: string
  name: string
  rpcUrls: [string, ...string[]]
  ss58Prefix?: number
  explorerUrls?: string[]
  testnet?: boolean
  faucetUrls?: string[]
}

/**
 * Defined Substrate Chain Constants
 */
export const development: SubstrateChain = {
  network: 'development',
  name: 'Local Development',
  ss58Prefix: 42,
  rpcUrls: ['ws://127.0.0.1:9944'],
  explorerUrls: [
    'https://polkadot.js.org/apps/#/explorer?rpc=ws://127.0.0.1:9944',
  ],
  testnet: true,
  faucetUrls: [
    'https://polkadot.js.org/apps/#/accounts?rpc=ws://127.0.0.1:9944',
  ],
}

export const alephzeroTestnet: SubstrateChain = {
  network: 'alephzero-testnet',
  name: 'Aleph Zero Testnet',
  ss58Prefix: 42,
  rpcUrls: ['wss://ws.test.azero.dev'],
  explorerUrls: ['https://azero.dev/?rpc=wss%3A%2F%2Fws.test.azero.dev'],
  testnet: true,
  faucetUrls: ['https://faucet.test.azero.dev'],
}

export const rococo: SubstrateChain = {
  network: 'rococo',
  name: 'Rococo',
  rpcUrls: ['wss://rococo-rpc.polkadot.io'],
  testnet: true,
  faucetUrls: ['https://matrix.to/#/#rococo-faucet:matrix.org'],
  explorerUrls: ['https://rococo.subscan.io'],
}

export const astar: SubstrateChain = {
  network: 'astar',
  name: 'Astar',
  ss58Prefix: 5,
  rpcUrls: ['wss://astar-rpc.dwellir.com'],
  faucetUrls: [],
  explorerUrls: ['https://astar.subscan.io'],
}

export const shiden: SubstrateChain = {
  network: 'shiden',
  name: 'Shiden',
  ss58Prefix: 5,
  rpcUrls: ['wss://shiden-rpc.dwellir.com'],
  explorerUrls: ['https://shiden.subscan.io'],
}

export const shibuya: SubstrateChain = {
  network: 'shibuya',
  name: 'Shibuya Testnet',
  testnet: true,
  ss58Prefix: 5,
  rpcUrls: ['wss://shibuya-rpc.dwellir.com'],
  faucetUrls: ['https://portal.astar.network/#/shibuya-testnet/assets'],
  explorerUrls: ['https://shibuya.subscan.io'],
}

/**
 * Exporting all chains separately
 */
export const allSubstrateChains: SubstrateChain[] = [
  development,
  alephzeroTestnet,
  rococo,
  astar,
  shiden,
  shibuya,
]

/**
 * Returns chain (if existent) for given identifier (`network` field).
 */
export const getSubstrateChain = (
  networkId?: string,
): SubstrateChain | undefined => {
  return allSubstrateChains.find(
    (chain) => chain.network.toLowerCase() === (networkId || '').toLowerCase(),
  )
}
