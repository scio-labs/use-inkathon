import { allPSP22Assets } from '@/assets'
import { psp22Abi } from '@/helpers/getAbi'
import { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import { AccountId } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'
import { BalanceFormatterOptions, formatBalance } from './formatBalance'
import { getMaxGasLimit } from './getGasLimit'

export type PSP22BalanceData = {
  tokenSlug: string
  tokenDecimals: number
  tokenSymbol: string
  iconPath: string
  balance?: BN
  balanceFormatted?: string
}

/**
 * Default refresh interval for the PSP-22 token balances.
 */
export const PSP22_TOKEN_BALANCE_SUBSCRIPTION_INTERVAL = 60000

/**
 * Returns the PSP-22 token balances of the given `address`.
 */
export const getPSP22Balances = async (
  api: ApiPromise,
  address: string | AccountId | undefined,
  activeChain: string,
  formatterOptions?: BalanceFormatterOptions,
): Promise<PSP22BalanceData[]> => {
  const psp22ContractMap: Record<string, ContractPromise> = {}

  if (!address) {
    const result = Object.values(allPSP22Assets)
      .filter(({ originChain }) => originChain === activeChain)
      .map(({ slug, decimals, symbol, iconPath }) => {
        return {
          tokenSlug: slug,
          tokenDecimals: decimals,
          tokenSymbol: symbol,
          iconPath,
        }
      })
    return result
  }

  const result = await Promise.all(
    Object.values(allPSP22Assets)
      .filter(({ originChain }) => originChain === activeChain)
      .map(async ({ slug, decimals, symbol, iconPath }) => {
        let balance = new BN(0)

        const contract = psp22ContractMap[slug]
        const _balanceOf = await contract.query['psp22::balanceOf'](
          address,
          { gasLimit: getMaxGasLimit(api) },
          address,
        )
        const balanceObj = _balanceOf?.output?.toPrimitive() as Record<string, any>

        balance = new BN(
          _balanceOf.output ? (balanceObj.ok as string) || (balanceObj.Ok as string) : '0',
        )

        const data = {
          tokenDecimals: decimals,
          tokenSymbol: symbol,
          balance,
        }

        const balanceFormatted = parsePSP22Balance(data, formatterOptions)
        return {
          balanceFormatted,
          tokenSlug: slug,
          iconPath,
          ...data,
        }
      }),
  )

  return result
}

/**
 * Watches the PSP-22 token balances of the given `address` and returns it in a callback.
 * The returned void function can be used to unsubscribe.
 */
export const watchPSP22Balances = (
  api: ApiPromise,
  address: string | AccountId | undefined,
  callback: (data: PSP22BalanceData[]) => void,
  activeChain: string,
  formatterOptions?: BalanceFormatterOptions,
): VoidFunction | null => {
  const psp22ContractMap: Record<string, ContractPromise> = {}

  Object.entries(allPSP22Assets).forEach(([slug, tokenInfo]) => {
    psp22ContractMap[slug] = new ContractPromise(api, psp22Abi, tokenInfo.metadata?.contractAddress)
  })

  if (!address) {
    const result = Object.values(allPSP22Assets)
      .filter(({ originChain }) => originChain === activeChain)
      .map(({ slug, decimals, symbol, iconPath }) => {
        return {
          tokenSlug: slug,
          tokenDecimals: decimals,
          tokenSymbol: symbol,
          iconPath,
        }
      })
    callback(result)
    return null
  }

  // Function to query the chain, parse data, and return promisified data
  const fetchTokenBalances = async () =>
    callback(
      await Promise.all(
        Object.values(allPSP22Assets)
          .filter(({ originChain }) => originChain === activeChain)
          .map(async ({ slug, decimals, symbol, iconPath }) => {
            let balance = new BN(0)

            const contract = psp22ContractMap[slug]
            const _balanceOf = await contract.query['psp22::balanceOf'](
              address,
              { gasLimit: getMaxGasLimit(api) },
              address,
            )
            const balanceObj = _balanceOf?.output?.toPrimitive() as Record<string, any>

            balance = new BN(
              _balanceOf.output ? (balanceObj.ok as string) || (balanceObj.Ok as string) : '0',
            )

            const data = {
              tokenDecimals: decimals,
              tokenSymbol: symbol,
              balance,
            }

            const balanceFormatted = parsePSP22Balance(data, formatterOptions)
            return {
              balanceFormatted,
              tokenSlug: slug,
              iconPath,
              ...data,
            }
          }),
      ),
    )

  fetchTokenBalances()

  // Create intervalId which can be used to unsubscribe
  const intervalId = setInterval(fetchTokenBalances, PSP22_TOKEN_BALANCE_SUBSCRIPTION_INTERVAL)

  return () => {
    clearInterval(intervalId)
  }
}

/**
 * Helper to parse the fetched PSP22 token balance data.
 */
export const parsePSP22Balance = (
  data: Omit<PSP22BalanceData, 'tokenSlug' | 'iconPath'>,
  formatterOptions?: BalanceFormatterOptions,
): string => {
  // Destructure necessary fields
  const { tokenDecimals, tokenSymbol, balance } = data

  // Format the balance
  const balanceFormatted: string = formatBalance(undefined, balance, formatterOptions, {
    tokenDecimals,
    tokenSymbol,
  })

  return balanceFormatted
}
