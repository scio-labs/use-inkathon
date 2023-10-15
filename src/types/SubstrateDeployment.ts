import { Abi } from '@polkadot/api-contract'
import { AccountId } from '@polkadot/types/interfaces'

export interface SubstrateDeployment {
  contractId: string
  networkId: string
  abi: string | Record<string, unknown> | Abi
  address: string | AccountId
}
