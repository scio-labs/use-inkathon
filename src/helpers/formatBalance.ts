import { BN } from '@polkadot/util'

/**
 * Formats the given `balance` (BN) to a string.
 */
export const formatBalance = (
  balance: BN,
  decimals: number,
  maxFractionDigits = 2,
): string => {
  const balanceNormalized =
    balance
      .div(new BN(10).pow(new BN(decimals - maxFractionDigits - 1)))
      .toNumber() /
    10 ** (maxFractionDigits + 1)
  const balanceFormatted = balanceNormalized.toLocaleString(undefined, {
    maximumFractionDigits: maxFractionDigits,
  })
  return balanceFormatted
}

/**
 * Formats the given `balance` (BN) to a string with fixed number of decimals.
 */
export const formatBalanceToFixed = (
  balance: BN,
  decimals: number,
  fractionDigits = 2,
): string => {
  const balanceNormalized =
    balance
      .div(new BN(10).pow(new BN(decimals - fractionDigits - 1)))
      .toNumber() /
    10 ** (fractionDigits + 1)
  const balanceFormatted = balanceNormalized.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  return balanceFormatted
}
