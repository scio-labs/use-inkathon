import { SubstrateDeployment } from '@/types'
import { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'

/**
 * Returns the first matching deployment from the given `deployments` array
 * with an equal `contractId` and `networkId`
 */
export const getDeployment = (
  deployments: SubstrateDeployment[],
  contractId: string,
  networkId: string,
) => {
  return deployments.find((deployment) => {
    return (
      deployment.contractId.toLowerCase() === contractId.toLowerCase() &&
      deployment.networkId.toLowerCase() === (networkId || '').toLowerCase()
    )
  })
}

/**
 * Takes the first matching deployment from the given `deployments` array
 * with an equal `contractId` and `networkId` and creates a `ContractPromise`.
 */
export const getDeploymentContract = (
  api: ApiPromise,
  deployments: SubstrateDeployment[],
  contractId: string,
  networkId: string,
) => {
  const deployment = getDeployment(deployments || [], contractId, networkId)
  if (!deployment) return undefined
  return new ContractPromise(api, deployment?.abi, deployment?.address)
}
