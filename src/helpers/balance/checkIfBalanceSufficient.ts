import { ApiPromise } from '@polkadot/api'
import { IKeyringPair } from '@polkadot/types/types'
import { BN, bnToBn } from '@polkadot/util'
import { getBalance } from './getBalance'

/**
 * Fetches the balance of the given address and returns a boolean
 * whether this is zero or below an optionally passed minimum value.
 */
export const checkIfBalanceSufficient = async (
  api: ApiPromise,
  account: IKeyringPair | string,
  minBalance?: bigint | BN | string | number,
): Promise<boolean> => {
  try {
    const accountAddress = typeof account === 'string' ? account : account.address
    const { reducibleBalance } = await getBalance(api, accountAddress)
    const hasZeroBalance = !reducibleBalance || reducibleBalance.isZero()
    const hasBalanceBelowMin =
      minBalance && reducibleBalance && reducibleBalance.lte(bnToBn(minBalance))
    return !hasZeroBalance && !hasBalanceBelowMin
  } catch (e) {
    console.error('Error while checking for minimum balance:', e)
  }

  return false
}
