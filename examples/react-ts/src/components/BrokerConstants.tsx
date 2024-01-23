import {
    BrokerConstantsType,
    getConstants,
    useInkathon
} from '@poppyseed/lastic-sdk';
import { useEffect, useState } from 'react';

function BrokerConstants() {
  const { api } = useInkathon();
  const [brokerConstants, setBrokerConstants] = useState<BrokerConstantsType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchConstants = async () => {
      try {
        const constants = await getConstants(api);
        if (isMounted) {
          setBrokerConstants(constants);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    };

    fetchConstants();

    return () => {
      isMounted = false;
    };
  }, [api]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!brokerConstants) {
    return <div>Loading broker constants...</div>;
  }

  return (
    <>
      <p>PalletId: {brokerConstants.palletId}</p>
      <p>Timeslice Period: {brokerConstants.timeslicePeriod}</p>
      <p>Max Leased Cores: {brokerConstants.maxLeasedCores}</p>
      <p>Max reserved Cores: {brokerConstants.maxReservedCores}</p>
    </>
  );
}

export default BrokerConstants;
