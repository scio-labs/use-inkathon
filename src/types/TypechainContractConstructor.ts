import { ApiPromise } from '@polkadot/api'
import { KeyringPair } from '@polkadot/keyring/types'

export type TypechainContractConstructor<T> = new (
  address: string,
  signer: KeyringPair,
  nativeAPI: ApiPromise,
) => T
