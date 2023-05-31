import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import { BN, formatBalance } from '@polkadot/util'

/**
 * Returns the native token balance of the given `address`.
 */
export const getBalance = async (
  api: ApiPromise,
  address: string | AccountId | undefined,
): Promise<{
  tokenDecimals: number
  tokenSymbol: string
  freeBalance?: BN
  reservedBalance?: BN
  balance?: BN
  balanceFormatted?: string
}> => {
  // Get the token decimals and symbol
  const tokenDecimals = api.registry.chainDecimals?.[0] || 12
  const tokenSymbol = api.registry.chainTokens?.[0] || 'Unit'

  if (!address) {
    return {
      tokenDecimals,
      tokenSymbol,
    }
  }

  // Get the balance
  const result: any = await api.query.system.account(address)
  const freeBalance: BN = new BN(result?.data?.free || 0)
  const reservedBalance: BN = new BN(result?.data?.reserved || 0)
  const balance = reservedBalance.add(freeBalance)

  // Format the balance
  const balanceFormatted = formatBalance(balance, {
    decimals: tokenDecimals,
  })

  return {
    freeBalance,
    reservedBalance,
    balance,
    balanceFormatted,
    tokenSymbol,
    tokenDecimals,
  }
}
