import { ApiPromise } from '@polkadot/api'
import type { WeightV2 } from '@polkadot/types/interfaces'
import { BN, bnToBn } from '@polkadot/util'

/**
 * Helper function that returns Weights V2 `gasLimit` object.
 */
export const getGasLimit = (api: ApiPromise, _refTime: string | BN, _proofSize: string | BN) => {
  const refTime = bnToBn(_refTime)
  const proofSize = bnToBn(_proofSize)

  return api.registry.createType('WeightV2', {
    refTime,
    proofSize,
  }) as WeightV2
}

/**
 * Helper function that returns the maximum gas limit Weights V2 object
 * for an extrinsiv based on the api chain constants.
 * NOTE: It's reduced by a given factor (defaults to 80%) to avoid storage exhaust.
 */
export const getMaxGasLimit = (api: ApiPromise, reductionFactor = 0.8) => {
  const blockWeights = api.consts.system.blockWeights.toPrimitive() as any
  const maxExtrinsic = blockWeights?.perClass?.normal?.maxExtrinsic
  const maxRefTime = maxExtrinsic?.refTime
    ? bnToBn(maxExtrinsic.refTime)
        .mul(new BN(reductionFactor * 100))
        .div(new BN(100))
    : new BN(0)
  const maxProofSize = maxExtrinsic?.proofSize
    ? bnToBn(maxExtrinsic.proofSize)
        .mul(new BN(reductionFactor * 100))
        .div(new BN(100))
    : new BN(0)

  return getGasLimit(api, maxRefTime, maxProofSize)
}
