import { ApiPromise } from '@polkadot/api'
import { BN, formatBalance as polkadotFormatBalance } from '@polkadot/util'

export type PolkadotBalanceFormatterOptions = NonNullable<
  Parameters<typeof polkadotFormatBalance>['1']
>

export type BalanceFormatterOptions = Omit<
  PolkadotBalanceFormatterOptions,
  'forceUnit'
> & {
  forceUnit?: string | undefined | false
  fixedDecimals?: number
  fixedIfNecessary?: boolean
}

/**
 * Improved & extended version of `formatBalance` from `@polkadot/util`.
 */
export const formatBalance = (
  api: ApiPromise | undefined,
  value?: BN,
  options?: BalanceFormatterOptions,
): string => {
  if (!value) return ''

  const tokenDecimals = api?.registry?.chainDecimals?.[0] || 12
  const tokenSymbol = api?.registry?.chainTokens?.[0] || 'Unit'

  const _options: BalanceFormatterOptions = Object.assign(
    {
      decimals: tokenDecimals,
      withZero: false,
      withUnit: true,
      forceUnit: '-',
    } satisfies BalanceFormatterOptions,
    options,
  )

  let formattedBalance = polkadotFormatBalance(value, {
    ..._options,
    withUnit: false,
  } as PolkadotBalanceFormatterOptions)

  // Convert to fixed decimals
  if (_options.fixedDecimals !== undefined) {
    // Remove siUnit amd add it back later
    let siUnit
    if (_options.forceUnit !== '-') {
      siUnit = formattedBalance.split(' ')[1]
      formattedBalance = formattedBalance.split(' ')[0]
    }

    if (_options.fixedIfNecessary) {
      formattedBalance = toFixedIfNecessary(
        formattedBalance,
        _options.fixedDecimals,
      ).toString()
    } else {
      formattedBalance = parseFloat(formattedBalance)
        .toFixed(_options.fixedDecimals)
        .toString()
    }

    if (siUnit) formattedBalance = `${formattedBalance} ${siUnit}`
  }

  // Place hairline space between number and `siUnit`
  if (_options.forceUnit !== '-') {
    const siUnit = formattedBalance.split(' ')[1]
    formattedBalance = formattedBalance.split(' ')[0]
    if (siUnit) formattedBalance = `${formattedBalance}\u200A${siUnit}`
  }

  // Add token symbol
  if (_options.withUnit === true) {
    formattedBalance = `${formattedBalance} ${tokenSymbol}`
  }

  return formattedBalance
}

// Source: https://stackoverflow.com/a/32229831/1381666
const toFixedIfNecessary = (value: string | number, decimals: number) => {
  const _value: string = typeof value === 'string' ? value : `${value}`
  return +parseFloat(_value).toFixed(decimals)
}
