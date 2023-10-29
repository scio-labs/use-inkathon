import { useInkathon } from '@/provider';
import { useEffect, useState } from 'react';
import { BrokerConstantsType } from '../types/GetConstants';


/**
 * Convert the Substrate constants to your BrokerConstantsType
 */
const convertToBrokerConstants = (brokerConsts: any): BrokerConstantsType => {
    return {
      palletId: brokerConsts.palletId.toString(),
      timeslicePeriod: brokerConsts.timeslicePeriod.toString(),
      maxLeasedCores: brokerConsts.maxLeasedCores.toString(),
      maxReservedCores: brokerConsts.maxReservedCores.toString(),
    };
  };

/**
 * Hook that returns the constants of the coretime chain.
 */
export const getConstants = () => {
    const { api } = useInkathon();
    const [brokerConstants, setBrokerConstants] = useState<BrokerConstantsType | null>(null);

    useEffect(() => {
        if (api) {
            // Assuming api.consts.broker returns the constants in the expected format
            const consts = convertToBrokerConstants(api.consts.broker);
            setBrokerConstants(consts);

        }
    }, [api]);

    return brokerConstants
}
