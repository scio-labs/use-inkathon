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
