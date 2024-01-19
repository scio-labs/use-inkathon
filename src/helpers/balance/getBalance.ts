import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'
import { BalanceFormatterOptions, formatBalance } from './formatBalance'

export type BalanceData = {
  tokenDecimals: number
  tokenSymbol: string
  freeBalance?: BN
  freeBalanceFormatted?: string
  reservedBalance?: BN
  reservedBalanceFormatted?: string
  reducibleBalance?: BN
  reducibleBalanceFormatted?: string
  balance?: BN
  balanceFormatted?: string
}

/**
 * Returns the native token balance of the given `address`.
 */
export const getBalance = async (
  api: ApiPromise,
  address: string | AccountId | undefined,
  formatterOptions?: BalanceFormatterOptions,
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
  const balanceData = parseBalanceData(api, result?.data, formatterOptions)

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
  formatterOptions?: BalanceFormatterOptions,
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
  const unsubscribe: any = await api.query.system.account(address, ({ data }: any) => {
    const balanceData = parseBalanceData(api, data, formatterOptions)
    callback(balanceData)
  })
  return unsubscribe
}

/**
 * Helper to parse the fetched balance data.
 */
const parseBalanceData = (
  api: ApiPromise,
  data?: any,
  formatterOptions?: BalanceFormatterOptions,
): BalanceData => {
  // Get the token decimals and symbol
  const tokenDecimals = api.registry.chainDecimals?.[0] || 12
  const tokenSymbol = api.registry.chainTokens?.[0] || 'Unit'

  // Get the balance
  const freeBalance: BN = new BN(data?.free || 0)
  const reservedBalance: BN = new BN(data?.reserved || 0)
  const balance = reservedBalance.add(freeBalance)

  // Calculate the reducible balance (see: https://substrate.stackexchange.com/a/3009/3470)
  const miscFrozenBalance: BN = new BN(data?.miscFrozen || 0)
  const feeFrozenBalance: BN = new BN(data?.feeFrozen || 0)
  const reducibleBalance = freeBalance.sub(
    miscFrozenBalance.gt(feeFrozenBalance) ? miscFrozenBalance : feeFrozenBalance,
  )

  // Format the balance
  const freeBalanceFormatted = formatBalance(api, freeBalance, formatterOptions)
  const reservedBalanceFormatted = formatBalance(api, reservedBalance, formatterOptions)
  const reducibleBalanceFormatted = formatBalance(api, reducibleBalance, formatterOptions)
  const balanceFormatted = formatBalance(api, balance, formatterOptions)

  return {
    tokenDecimals,
    tokenSymbol,
    freeBalance,
    freeBalanceFormatted,
    reservedBalance,
    reservedBalanceFormatted,
    reducibleBalance,
    reducibleBalanceFormatted,
    balance,
    balanceFormatted,
  }
}
