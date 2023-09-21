import psp22Asset from '@PSP22Asset.json'
import { _PSP22_ABI } from '@helpers/getAbi'
import { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import { AccountId } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'
import { ChainAsset } from '@types'
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
 * Returns the PSP-22 token balances of the given `address`.
 */

export const getPSP22Balances = async (
  api: ApiPromise,
  address: string | AccountId | undefined,
  formatterOptions?: BalanceFormatterOptions,
): Promise<PSP22BalanceData[]> => {
  const tokens = psp22Asset as Record<string, ChainAsset>
  const psp22ContractMap: Record<string, ContractPromise> = {}

  Object.entries(tokens).forEach(([slug, tokenInfo]) => {
    psp22ContractMap[slug] = new ContractPromise(
      api,
      _PSP22_ABI,
      tokenInfo.metadata?.contractAddress,
    )
  })

  if (!address) {
    const result = Object.values(tokens).map(({ slug, decimals, symbol, iconPath }) => {
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
    Object.values(tokens).map(async ({ slug, decimals, symbol, iconPath }) => {
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
        tokenSlug: slug,
        tokenDecimals: decimals,
        tokenSymbol: symbol,
        balance,
        iconPath,
      }

      const psp22BalanceData = parsePSP22Balance(data, formatterOptions)
      return psp22BalanceData
    }),
  )

  return result
}

/**
 * Watches the PSP-22 token balances of the given `address` and returns it in a callback.
 * The returned void function can be used to unsubscribe.
 */
export const watchPSP22Balances = async (
  api: ApiPromise,
  address: string | AccountId | undefined,
  callback: (data: PSP22BalanceData[]) => void,
  formatterOptions?: BalanceFormatterOptions,
): Promise<VoidFunction | null> => {
  const tokens = psp22Asset as Record<string, ChainAsset>
  const psp22ContractMap: Record<string, ContractPromise> = {}

  Object.entries(tokens).forEach(([slug, tokenInfo]) => {
    psp22ContractMap[slug] = new ContractPromise(
      api,
      _PSP22_ABI,
      tokenInfo.metadata?.contractAddress,
    )
  })

  if (!address) {
    const result = Object.values(tokens).map(({ slug, decimals, symbol, iconPath }) => {
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

  const result: PSP22BalanceData[] = []

  // Query the chain, parse data, and call the callback
  const unsubscribe: any = await Promise.all(
    Object.values(tokens).map(async ({ slug, decimals, symbol, iconPath }) => {
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
        tokenSlug: slug,
        tokenDecimals: decimals,
        tokenSymbol: symbol,
        balance,
        iconPath,
      }

      const psp22BalanceData = parsePSP22Balance(data, formatterOptions)
      result.push(psp22BalanceData)
    }),
  )

  callback(result)

  return unsubscribe
}

/**
 * Helper to parse the fetched PSP22 token balance data.
 */

export const parsePSP22Balance = (
  data: PSP22BalanceData,
  formatterOptions?: BalanceFormatterOptions,
): PSP22BalanceData => {
  // Destructure necessary fields
  const { tokenSlug, tokenDecimals, tokenSymbol, balance, iconPath } = data

  // Format the balance
  const balanceFormatted: string = formatBalance(undefined, balance, formatterOptions, {
    tokenDecimals,
    tokenSymbol,
  })

  return {
    tokenSlug,
    tokenDecimals,
    tokenSymbol,
    iconPath,
    balance,
    balanceFormatted,
  }
}
