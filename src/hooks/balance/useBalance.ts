import { BalanceData, BalanceFormatterOptions, getBalance, watchBalance } from '@/helpers'
import { useInkathon } from '@/provider'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'

/**
 * Hook that returns the native token balance of the given `address`.
 */
export const useBalance = (
  address?: string | AccountId,
  watch?: boolean,
  formatterOptions?: BalanceFormatterOptions,
): BalanceData => {
  const { api } = useInkathon()
  const [balanceData, setBalanceData] = useState<BalanceData>({
    tokenSymbol: 'Unit',
    tokenDecimals: 12,
  } satisfies BalanceData)
  const [unsubscribes, setUnsubscribes] = useState<(VoidFunction | null)[]>([])

  useEffect(() => {
    const updateBalanceData = (data: BalanceData) => {
      setBalanceData(() => data)
    }

    if (!api) {
      updateBalanceData({} as BalanceData)
      return
    }

    if (watch) {
      watchBalance(api, address, updateBalanceData, formatterOptions).then((unsubscribe) => {
        setUnsubscribes((prev) => [...prev, unsubscribe])
      })
    } else {
      getBalance(api, address, formatterOptions).then(updateBalanceData)
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe?.())
      setUnsubscribes(() => [])
    }
  }, [api, address])

  return balanceData
}

/**
 * Hook that returns the native token balance of the relay chain of the given `address`.
 */
export const useRelayBalance = (
  address?: string | AccountId,
  watch?: boolean,
  formatterOptions?: BalanceFormatterOptions,
): BalanceData => {
  const { relayApi } = useInkathon()
  const [balanceData, setBalanceData] = useState<BalanceData>({
    tokenSymbol: 'Unit',
    tokenDecimals: 12,
  } satisfies BalanceData)
  const [unsubscribes, setUnsubscribes] = useState<(VoidFunction | null)[]>([])

  useEffect(() => {
    const updateBalanceData = (data: BalanceData) => {
      setBalanceData(() => data)
    }

    if (!relayApi) {
      updateBalanceData({} as BalanceData)
      return
    }

    if (watch) {
      watchBalance(relayApi, address, updateBalanceData, formatterOptions).then((unsubscribe) => {
        setUnsubscribes((prev) => [...prev, unsubscribe])
      })
    } else {
      getBalance(relayApi, address, formatterOptions).then(updateBalanceData)
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe?.())
      setUnsubscribes(() => [])
    }
  }, [relayApi, address])

  return balanceData
}
