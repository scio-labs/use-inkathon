import { SubstrateChain } from '@/types'
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api'
import { ApiOptions } from '@polkadot/api/types'
import { cryptoWaitReady } from '@polkadot/util-crypto'

/**
 * Helper to initialize polkadot.js API with given chain and options.
 */
export const initPolkadotJs = async (
  chain: SubstrateChain,
  options?: Omit<ApiOptions, 'provider'>,
): Promise<{ api: ApiPromise; provider: WsProvider | HttpProvider }> => {
  const rpcUrl = chain.rpcUrls[0]
  if (!rpcUrl) {
    throw new Error('Given chain has no RPC url defined')
  }

  // Wait for crypto to be ready to prevent initialization issues
  await cryptoWaitReady()

  const provider = rpcUrl.startsWith('http') ? new HttpProvider(rpcUrl) : new WsProvider(rpcUrl)
  const api = await ApiPromise.create({
    provider,
    ...options,
  })

  return { api, provider }
}
