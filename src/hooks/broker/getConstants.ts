import { ApiPromise } from '@polkadot/api'
import { BrokerConstantsType } from '../../types/broker/GetConstants'

/**
 * Convert the Substrate constants to your BrokerConstantsType
 */
const convertToBrokerConstants = (brokerConsts: any): BrokerConstantsType => {
  return {
    palletId: brokerConsts.palletId.toString(),
    timeslicePeriod: parseInt(brokerConsts.timeslicePeriod.toString(), 10),
    maxLeasedCores: parseInt(brokerConsts.maxLeasedCores.toString(), 10),
    maxReservedCores: parseInt(brokerConsts.maxReservedCores.toString(), 10),
  }
}

/**
 * Hook that returns the constants of the coretime chain.
 */
export const getConstants = async (
  api: ApiPromise | undefined,
): Promise<BrokerConstantsType | null> => {
  if (!api) return null

  try {
    // Assuming api.consts.broker returns the constants in the expected format
    const consts = convertToBrokerConstants(api.consts.broker)
    return consts
  } catch (error) {
    console.error('Error fetching broker constants:', error)
    return null
  }
}
