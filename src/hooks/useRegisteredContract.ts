import { useInkathon } from '@/provider'
import { getDeployment } from '@/registry'
import { useContract } from './useContract'

/**
 * React Hook that returns a `ContractPromise` object configured with
 * the active api & chain as well as the given deployment contract id
 * which is looked up from the deployments registry.
 */
export const useRegisteredContract = (contractId: string, networkId?: string) => {
  const { deployments, activeChain } = useInkathon()
  networkId = networkId || activeChain?.network || ''
  const deployment = getDeployment(deployments || [], contractId, networkId)
  return useContract(deployment?.abi, deployment?.address)
}
