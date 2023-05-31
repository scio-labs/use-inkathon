import { getBalance } from '@helpers/getBalance'
import { AccountId } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'
import { useInkathon } from '@provider'
import { useEffect, useState } from 'react'

/**
 * Hook that returns the native token balance of the given `address`.
 */
export const useBalance = (address?: string | AccountId) => {
  const { api } = useInkathon()
  const [freeBalance, setFreeBalance] = useState<BN>()
  const [reservedBalance, setReservedBalance] = useState<BN>()
  const [balance, setBalance] = useState<BN>()
  const [balanceFormatted, setBalanceFormatted] = useState<string>()
  const [tokenSymbol, setTokenSymbol] = useState<string>()
  const [tokenDecimals, setTokenDecimals] = useState<number>()

  useEffect(() => {
    ;(async () => {
      if (!api) {
        setFreeBalance(undefined)
        setReservedBalance(undefined)
        setBalance(undefined)
        setBalanceFormatted(undefined)
        setTokenSymbol(undefined)
        setTokenDecimals(undefined)
        return
      }

      const result = await getBalance(api, address)

      setFreeBalance(result.freeBalance)
      setReservedBalance(result.reservedBalance)
      setBalance(result.balance)
      setBalanceFormatted(
        result.balanceFormatted &&
          `${result.balanceFormatted} ${result.tokenSymbol}`,
      )
      setTokenSymbol(result.tokenSymbol)
      setTokenDecimals(result.tokenDecimals)
    })()
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
