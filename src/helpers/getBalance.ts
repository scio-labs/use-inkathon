import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { BN, formatBalance } from '@polkadot/util'

export type BalanceData = {
  tokenDecimals: number
  tokenSymbol: string
  freeBalance?: BN
  reservedBalance?: BN
  balance?: BN
  balanceFormatted?: string
}

/**
 * Returns the native token balance of the given `address`.
 */
export const getBalance = async (
  api: ApiPromise,
  address: string | AccountId | undefined,
): Promise<BalanceData> => {
  if (!address) {
    const { tokenDecimals, tokenSymbol } = parseBalanceData(api)
    return {
      tokenDecimals,
      tokenSymbol,
    }
  }

  // Query the chain and parse data
  const result: any = await api.query.system.account(address)
  const balanceData = parseBalanceData(api, result?.data)

  return balanceData
}

/**
 * Watches the native token balance of the given `address` and returns it in a callback.
 * The returned void function can be used to unsubscribe.
 */
export const watchBalance = async (
  api: ApiPromise,
  address: string | AccountId | undefined,
  callback: (data: BalanceData) => void,
): Promise<VoidFunction | null> => {
  const { tokenDecimals, tokenSymbol } = parseBalanceData(api)
  if (!address) {
    callback({
      tokenDecimals,
      tokenSymbol,
    })
    return null
  }

  // Query the chain, parse data, and call the callback
  const unsubscribe: any = await api.query.system.account(
    address,
    ({ data }: any) => {
      const balanceData = parseBalanceData(api, data)
      callback(balanceData)
    },
  )
  return unsubscribe
}

/**
 * Helper to parse the fetched balance data.
 */
const parseBalanceData = (api: ApiPromise, data?: any): BalanceData => {
  // Get the token decimals and symbol
  const tokenDecimals = api.registry.chainDecimals?.[0] || 12
  const tokenSymbol = api.registry.chainTokens?.[0] || 'Unit'

  // Get the balance
  const freeBalance: BN = new BN(data?.free || 0)
  const reservedBalance: BN = new BN(data?.reserved || 0)
  const balance = reservedBalance.add(freeBalance)

  // Format the balance
  const balanceFormatted = formatBalance(balance, {
    decimals: tokenDecimals,
  })

  return {
    tokenDecimals,
    tokenSymbol,
    freeBalance,
    reservedBalance,
    balance,
    balanceFormatted,
  }
}
