import { ApiPromise, Keyring } from '@polkadot/api'
import { IKeyringPair } from '@polkadot/types/types/interfaces'
import {
  BalanceData,
  SubstrateChain,
  getBalance,
  getSubstrateChain,
  initPolkadotJs as initApi,
} from '@scio-labs/use-inkathon'

/**
 * Initialize Polkadot.js API with given RPC & account from given URI.
 */
export type InitParams = {
  chain: SubstrateChain
  api: ApiPromise
  keyring: Keyring
  account: IKeyringPair
  balance: BalanceData
  decimals: number
  symbol: string
  prefix: number
}
export const initPolkadotJs = async (chainId: string, uri: string): Promise<InitParams> => {
  const chain = getSubstrateChain(chainId)
  if (!chain) throw new Error(`Chain '${chainId}' not found`)

  // Initialize api
  const { api } = await initApi(chain, { noInitWarn: true })

  // Print chain info
  const network = (await api.rpc.system.chain())?.toString() || ''
  const version = (await api.rpc.system.version())?.toString() || ''
  console.log(`Initialized API on ${network} (${version})`)

  // Get decimals & prefix
  const decimals = api.registry.chainDecimals?.[0] || 12
  const symbol = api.registry.chainTokens?.[0] || 'Unit'
  const prefix = api.registry.chainSS58 || 42

  // Initialize account & set signer
  const keyring = new Keyring({ type: 'sr25519' })
  const account = keyring.addFromUri(uri)
  const balance = await getBalance(api, account.address)
  console.log(`Initialized Account: ${account.address} (${balance.balanceFormatted})\n`)

  return { api, chain, keyring, account, balance, decimals, symbol, prefix }
}
