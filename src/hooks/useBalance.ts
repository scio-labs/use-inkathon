import { AccountId } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'
import { useInkathon } from '@provider'
import { useEffect, useState } from 'react'

/**
 * Returns the balance of native tokens from the given `address`
 */
export const useBalance = (address?: string | AccountId) => {
  const { api } = useInkathon()
  const [balance, setBalance] = useState<BN>()
  const [balanceFormatted, setBalanceFormatted] = useState<string>()
  const [tokenSymbol, setTokenSymbol] = useState<string>()
  const [tokenDecimals, setTokenDecimals] = useState<number>()

  const update = async () => {
    if (!api || !address) {
      setBalance(undefined)
      setBalanceFormatted(undefined)
      if (!api) setTokenSymbol(undefined)
      return
    }

    const properties =
      ((await api.rpc.system.properties())?.toHuman() as any) || {}
    const tokenSymbol = properties?.tokenSymbol?.[0] || 'UNIT'
    const tokenDecimals = properties?.tokenDecimals?.[0] || 12
    const result: any = await api.query.system.account(address)
    const data: any = result?.data
    const balance = data?.reserved?.add?.(data?.free)
    const balanceNormalized =
      balance?.div?.(new BN(10).pow(new BN(tokenDecimals - 2))).toNumber() / 100
    const balanceFormatted = balanceNormalized.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    setBalance(balance)
    setBalanceFormatted(`${balanceFormatted} ${tokenSymbol}`)
    setTokenSymbol(tokenSymbol)
    setTokenDecimals(tokenDecimals)
  }
  useEffect(() => {
    update()
  }, [api, address])

  return {
    balance,
    balanceFormatted,
    tokenSymbol,
    tokenDecimals,
  }
}
