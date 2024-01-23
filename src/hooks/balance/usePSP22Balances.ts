import {
  BalanceFormatterOptions,
  PSP22BalanceData,
  getPSP22Balances,
  watchPSP22Balances,
} from '@/helpers'
import { useInkathon } from '@/provider'
import { AccountId } from '@polkadot/types/interfaces'
import { useEffect, useState } from 'react'

/**
 * Hook that returns the PSP-22 token balances of the given `address`.
 */
export const usePSP22Balances = (
  address?: string | AccountId,
  watch?: boolean,
  formatterOptions?: BalanceFormatterOptions,
): PSP22BalanceData[] => {
  const { api, activeChain } = useInkathon()
  const [balanceData, setBalanceData] = useState<PSP22BalanceData[]>(
    [] satisfies PSP22BalanceData[],
  )
  const [unsubscribes, setUnsubscribes] = useState<(VoidFunction | null)[]>([])

  useEffect(() => {
    const updateBalanceData = (data: PSP22BalanceData[]) => {
      setBalanceData(() => data)
    }

    if (!api || !activeChain) {
      setBalanceData([] as PSP22BalanceData[])
      return
    }

    if (watch) {
      const unsubscribe = watchPSP22Balances(
        api,
        address,
        updateBalanceData,
        activeChain.network,
        formatterOptions,
      )
      unsubscribe && setUnsubscribes((prev) => [...prev, unsubscribe])
    } else {
      getPSP22Balances(api, address, activeChain.network, formatterOptions).then(updateBalanceData)
    }

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe?.())
      setUnsubscribes(() => [])
    }
  }, [api, address, activeChain])

  return balanceData
}
