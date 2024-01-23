import { ApiPromise } from '@polkadot/api'

export type CheckIfBrokerExistsType = boolean

export const CheckIfBrokerExists = async (
  api: ApiPromise | undefined,
): Promise<CheckIfBrokerExistsType> => {
  if (!api) return false
  return !!(api.tx.broker && api.tx.broker.purchase)
}
