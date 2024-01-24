import { useRegisteredContract } from '@/hooks/useRegisteredContract'
import { useInkathon } from '@/provider'
import { TypechainContractConstructor } from '@/types'
import { useEffect, useState } from 'react'

/**
 * React Hook that returns a type-safe contract object by `typechain-polkadot`,
 * configured with the active api & chain for the given deployment contract id
 * which is looked up from the deployments registry.
 */
export const useRegisteredTypedContract = <T>(
  contractId: string,
  Contract: TypechainContractConstructor<T>,
  networkId?: string,
) => {
  const { api, activeAccount } = useInkathon()
  const registeredContract = useRegisteredContract(contractId, networkId)

  const [typedContract, setTypedContract] = useState<T | undefined>(undefined)
  useEffect(() => {
    if (!registeredContract?.address || !activeAccount?.address || !api) {
      setTypedContract(undefined)
      return
    }

    // IMPORTANT: Right now, only KeyringPair is supported as signer, but as we don't have
    //            those anyways in the frontend, we can alreaday start using the new API.
    const typedContract = new Contract(
      registeredContract.address.toString(),
      activeAccount.address as any,
      api,
    )
    setTypedContract(typedContract)
  }, [registeredContract?.address, activeAccount?.address])

  return { ...registeredContract, typedContract }
}
