import { ApiPromise } from '@polkadot/api'
import { BN, formatBalance as polkadotFormatBalance } from '@polkadot/util'

export type PolkadotBalanceFormatterOptions = NonNullable<
  Parameters<typeof polkadotFormatBalance>['1']
>

export type BalanceFormatterOptions = Omit<
  PolkadotBalanceFormatterOptions,
  'forceUnit' | 'withZero'
> & {
  forceUnit?: string | undefined | false
  fixedDecimals?: number
  removeTrailingZeros?: boolean
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
      withUnit: true,
      forceUnit: '-',
    } satisfies BalanceFormatterOptions,
    options,
  )

  let formattedBalance = polkadotFormatBalance(value, {
    ..._options,
    withUnit: false,
    withZero: false,
  } as PolkadotBalanceFormatterOptions)

  // Convert to fixed decimals
  if (_options.fixedDecimals !== undefined) {
    // Remove siUnit amd add it back later
    let siUnit
    if (_options.forceUnit !== '-') {
      siUnit = formattedBalance.split(' ')[1]
      formattedBalance = formattedBalance.split(' ')[0]
    }

    // Apply fixed decimals
    formattedBalance = toFixed(
      formattedBalance,
      _options.fixedDecimals,
      _options.removeTrailingZeros,
    )

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

/**
 * Helper function to convert a number (as string) to have fixed decimals.
 */
const toFixed = (value: string | number, decimals: number, removeTrailingZeros?: boolean) => {
  const _value: string = typeof value === 'string' ? value : `${value}`

  let valueDecimals = _value.split('.')[1] || '0'
  valueDecimals = parseFloat(`0.${valueDecimals}`).toFixed(decimals)
  if (removeTrailingZeros) {
    valueDecimals = `${+valueDecimals}`
  }

  const formattedValue = valueDecimals.split('.')[1]
    ? `${_value.split('.')[0]}.${valueDecimals.split('.')[1]}`
    : _value.split('.')[0]

  return formattedValue
}
