import { BalanceFormatterOptions } from '@helpers'
import { BalanceData, getBalance, watchBalance } from '@helpers/getBalance'
import { AccountId } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'
import { useInkathon } from '@provider'
import { useEffect, useState } from 'react'

/**
 * Hook that returns the native token balance of the given `address`.
 */
export const useBalance = (
  address?: string | AccountId,
  watch?: boolean,
  formatterOptions?: BalanceFormatterOptions,
) => {
  const { api } = useInkathon()
  const [freeBalance, setFreeBalance] = useState<BN>()
  const [reservedBalance, setReservedBalance] = useState<BN>()
  const [balance, setBalance] = useState<BN>()
  const [balanceFormatted, setBalanceFormatted] = useState<string>()
  const [tokenSymbol, setTokenSymbol] = useState<string>()
  const [tokenDecimals, setTokenDecimals] = useState<number>()
  const [unsubscribes, setUnsubscribes] = useState<(VoidFunction | null)[]>([])

  useEffect(() => {
    const updateBalanceData = (data: BalanceData) => {
      setFreeBalance(data.freeBalance)
      setReservedBalance(data.reservedBalance)
      setBalance(data.balance)
      setBalanceFormatted(data.balanceFormatted)
      setTokenSymbol(data.tokenSymbol)
      setTokenDecimals(data.tokenDecimals)
    }

    if (!api) {
      updateBalanceData({} as BalanceData)
      return
    }

    if (watch) {
      watchBalance(api, address, updateBalanceData, formatterOptions).then(
        (unsubscribe) => {
          setUnsubscribes((prev) => [...prev, unsubscribe])
        },
      )
    } else {
      getBalance(api, address, formatterOptions).then(updateBalanceData)
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe?.())
      setUnsubscribes(() => [])
    }
  }, [api, address])

  return {
    freeBalance,
    reservedBalance,
    balance,
    balanceFormatted,
    tokenSymbol,
    tokenDecimals,
  }
}
