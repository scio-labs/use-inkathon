import { ApiPromise } from '@polkadot/api'
import type { WeightV2 } from '@polkadot/types/interfaces'
import { BN } from '@polkadot/util'

/**
 * Helper function that returns Weights V2 `gasLimit` object.
 */
export const getGasLimit = (
  api: ApiPromise,
  _refTime: string | BN,
  _proofSize: string | BN,
) => {
  const refTime = typeof _refTime == 'string' ? new BN(_refTime) : _refTime
  const proofSize =
    typeof _proofSize == 'string' ? new BN(_proofSize) : _proofSize

  return api.registry.createType('WeightV2', {
    refTime,
    proofSize,
  }) as WeightV2
}

/**
 * Helper function that returns the maximum possible gas limit Weights V2 object.
 */
export const getMaxGasLimit = (api: ApiPromise) => {
  return getGasLimit(api, new BN(1_000_000_000), new BN(5_000_000_000_000))
}
