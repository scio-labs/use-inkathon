import { SignedBlock } from '@polkadot/types/interfaces'

export interface DeployedContract {
  address: string
  hash: string
  block: SignedBlock
  blockNumber: number
}
