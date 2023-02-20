/**
 * Substrate Chain Type
 */
export interface SubstrateChain {
  network: string
  name: string
  rpcUrls: [string, ...string[]]
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
  rpcUrls: ['wss://ws.test.azero.dev'],
  explorerUrls: ['https://azero.dev/?rpc=wss%3A%2F%2Fws.test.azero.dev'],
  testnet: true,
  faucetUrls: ['https://faucet.test.azero.dev'],
}

export const polkadot: SubstrateChain = {
  network: 'polkadot',
  name: 'Polkadot',
  rpcUrls: ['wss://rpc.polkadot.io'],
  explorerUrls: ['https://polkadot.subscan.io'],
}

export const kusama: SubstrateChain = {
  network: 'kusama',
  name: 'Kusama',
  rpcUrls: ['wss://kusama-rpc.polkadot.io'],
  explorerUrls: ['https://kusama.subscan.io'],
  faucetUrls: ['https://guide.kusama.network/docs/kusama-claims'],
}

export const westend: SubstrateChain = {
  network: 'westend',
  name: 'Westend',
  rpcUrls: ['wss://westend-rpc.polkadot.io'],
  explorerUrls: ['https://westend.subscan.io'],
  testnet: true,
  faucetUrls: ['https://matrix.to/#/#westend_faucet:matrix.org'],
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
  rpcUrls: ['wss://astar.public.blastapi.io', 'wss://astar-rpc.dwellir.com'],
  faucetUrls: [],
  explorerUrls: ['https://astar.subscan.io'],
}

export const shiden: SubstrateChain = {
  network: 'shiden',
  name: 'Shiden',
  rpcUrls: ['wss://shiden.public.blastapi.io', 'wss://shiden-rpc.dwellir.com'],
  explorerUrls: ['https://shiden.subscan.io'],
}

export const shibuya: SubstrateChain = {
  network: 'shibuya',
  name: 'Shibuya',
  rpcUrls: ['wss://shibuya-rpc.dwellir.com'],
  testnet: true,
  faucetUrls: ['https://portal.astar.network/#/shibuya-testnet/assets'],
  explorerUrls: ['https://shibuya.subscan.io'],
}

/**
 * Exporting all chains separately
 */
export const allSubstrateChains: SubstrateChain[] = [
  development,
  alephzeroTestnet,
  polkadot,
  kusama,
  westend,
  rococo,
  astar,
  shiden,
  shibuya,
]

/**
 * Returns chain (if existent) for given identifier (`network` field).
 */
export const getSubstrateChain = (
  networkId: string,
): SubstrateChain | undefined => {
  return allSubstrateChains.find(
    (chain) => chain.network.toLowerCase() === networkId.toLowerCase(),
  )
}
