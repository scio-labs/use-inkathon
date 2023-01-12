import { Abi, ContractPromise } from '@polkadot/api-contract'
import { AccountId } from '@polkadot/types/interfaces'
import { useInkathon } from '@provider'
import { useEffect, useState } from 'react'

/**
 * React Hook that returns a `ContractPromise` object configured with
 * the active api & chain as well as the given `abi` and `address`.
 */
export const useContract = (
  abi?: string | Record<string, unknown> | Abi,
  address?: string | AccountId,
) => {
  const { api } = useInkathon()
  const [contract, setContract] = useState<ContractPromise | undefined>()

  const initialize = async () => {
    if (!api || !abi || !address) {
      setContract(undefined)
      return
    }
    const contract = new ContractPromise(api, abi, address)
    setContract(contract)
  }
  useEffect(() => {
    initialize()
  }, [api, abi, address])

  return {
    contract,
  }
}
