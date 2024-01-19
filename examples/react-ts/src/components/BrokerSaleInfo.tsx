import { ApiPromise } from '@polkadot/api';
import {
    BrokerConstantsType,
    ConfigurationType,
    SaleInfoType,
    StatusType,
    blocksToTimeFormat,
    getConstants,
    getCurrentBlockNumber,
    useInkathon,
} from '@poppyseed/lastic-sdk';
import { useEffect, useMemo, useState } from 'react';

  // Define a type for the queryParams
  type QueryParams = (string | number | Record<string, unknown>)[];
  
// Custom hook for querying substrate state
function useSubstrateQuery(api: ApiPromise, queryKey: string, queryParams: QueryParams = []) {  
    const [data, setData] = useState<string | null>(null);
  
    useEffect(() => {
      let intervalId: NodeJS.Timeout;
  
      const fetchData = async () => {
        if (api?.query?.broker?.[queryKey]) {
          try {
            const result = await api.query.broker[queryKey](...queryParams);
            // Check if the Option type is Some and unwrap the value
            if (!!result) {
              setData(result.toString());
            } else {
              setData(null);
            }
          } catch (error) {
            console.error(`Failed to fetch ${queryKey}:`, error);
          }
        }
      };
  
      fetchData();
      intervalId = setInterval(fetchData, 5000);
  
      return () => clearInterval(intervalId);
    }, [api, queryKey, queryParams]);
  
    return data;
  }

function useCurrentBlockNumber(api: ApiPromise) {
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);

    useEffect(() => {
        if (!api) return;

        const fetchCurrentBlockNumber = async () => {
        const currentBlock = await getCurrentBlockNumber(api);
        setCurrentBlockNumber(currentBlock);
        };

        const intervalId = setInterval(fetchCurrentBlockNumber, 1000); // Update every second

        return () => clearInterval(intervalId);
    }, [api]);

    return currentBlockNumber;
}

function useBrokerConstants(api: ApiPromise) {
    const [brokerConstants, setBrokerConstants] = useState<BrokerConstantsType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
    
        const fetchConstants = async () => {
          try {
            const constants = await getConstants(api);
            if (isMounted) {
              setBrokerConstants(constants);
              setIsLoading(false);
            }
          } catch (err) {
            console.error(err);
            setIsLoading(false);
          }
        };
    
        fetchConstants();
    
        return () => {
          isMounted = false;
        };
    }, [api]);

    return { brokerConstants, isLoading };
}
  
  function saleStatus(currentBlockNumber: number, saleInfo: SaleInfoType, config: ConfigurationType, constant: BrokerConstantsType): string {
    let typeOfChain: 'PARA' | 'RELAY' | 'LOCAL' = 'LOCAL'
    let divide_by_2_or_not: 1 | 2 = 1;
    if (!(typeOfChain === 'LOCAL'))  {
        divide_by_2_or_not = 2
    }

    let saleEnds: number = saleInfo.saleStart + config.regionLength * constant.timeslicePeriod / divide_by_2_or_not  - config.interludeLength

    if (currentBlockNumber < saleInfo.saleStart) {
      const timeUntilStart = blocksToTimeFormat(saleInfo.saleStart - currentBlockNumber, 'LOCAL');
      return `Interlude Period - time to renew your core! Sales will start in ${timeUntilStart}.`;
    } else if (currentBlockNumber < saleInfo.saleStart + config.leadinLength) {
      const timeUntilStabilize = blocksToTimeFormat(saleInfo.saleStart + config.leadinLength - currentBlockNumber, 'LOCAL');
      return `Sales have started we are now in the lead-in period. The price is linearaly decreasing with each block, and will stablize in ${timeUntilStabilize}.`;
    } else if (currentBlockNumber <= saleEnds) {
      const timeUntilEnd = blocksToTimeFormat(saleEnds - currentBlockNumber, 'LOCAL');
      return `Sale is in the purchase period. Sale ends in ${timeUntilEnd}.`;
    } else {
      return `The sale has ended.`;
    }
  }

  function calculateCurrentPrice(currentBlockNumber: number, saleInfo: SaleInfoType, config: ConfigurationType): number {
    if (currentBlockNumber < saleInfo.saleStart + config.leadinLength && currentBlockNumber > saleInfo.saleStart) {
      return saleInfo.price * (2 - (currentBlockNumber - saleInfo.saleStart) / config.leadinLength);
    } else {
      return saleInfo.price;
    }
  }
  
  
  export default function BrokerSaleInfo() {
    const { api } = useInkathon();
    if (!api) return <div>API not available</div>;

    const currentBlockNumber = useCurrentBlockNumber(api);

    const saleInfoString = useSubstrateQuery(api, 'saleInfo');
    const configurationString = useSubstrateQuery(api, 'configuration');
    const statusString = useSubstrateQuery(api, 'status');

    const { brokerConstants, isLoading: isConstantsLoading } = useBrokerConstants(api);
  
    const saleInfo = useMemo(() => saleInfoString ? JSON.parse(saleInfoString) as SaleInfoType : null, [saleInfoString]);
    const configuration = useMemo(() => configurationString ? JSON.parse(configurationString) as ConfigurationType : null, [configurationString]);
    const status = useMemo(() => statusString ? JSON.parse(statusString) as StatusType : null, [statusString]);

    // Update saleStage every second based on the currentBlockNumber
    const [saleStage, setSaleStage] = useState('');
    useEffect(() => {
        if (saleInfo && configuration && brokerConstants) {
            setSaleStage(saleStatus(currentBlockNumber, saleInfo, configuration, brokerConstants));
        }
    }, [currentBlockNumber, saleInfo, configuration, brokerConstants]);

    if (
      !saleInfo ||
      !configuration || 
      !status ||
      isConstantsLoading
      ) {
      return <div>Loading...</div>;
    }
  
    return (
      <div>
        <h2><b>Sale Info:</b></h2>
        <div>
          availableCores: {saleInfo.coresOffered - saleInfo.coresSold}
        </div>
        <div>
          coresSold: {saleInfo.coresSold} / {saleInfo.coresOffered}
        </div>
        <div>
            currentPrice: {calculateCurrentPrice(currentBlockNumber, saleInfo, configuration)}
        </div>
        <div>
            {saleStage}
        </div>
        <div>
            leadinLength: {saleInfo.leadinLength}
            price: {saleInfo.price}
            regionBegin: {saleInfo.regionBegin}
            regionEnd: {saleInfo.regionEnd}
            idealCoresSold: {saleInfo.idealCoresSold}
            firstCore: {saleInfo.firstCore}
            selloutPrice: {saleInfo.selloutPrice}
        </div>
        <div><b>Configuration:</b></div>
        <div>
            advanceNotice: {configuration.advanceNotice}
            interludeLength: {configuration.interludeLength}
            leadinLength: {configuration.leadinLength}
            regionLength: {configuration.regionLength}
            idealBulkProportion: {configuration.idealBulkProportion}
            limitCoresOffered: {configuration.limitCoresOffered}
            renewalBump: {configuration.renewalBump}
            contributionTimeout: {configuration.contributionTimeout}
        </div>      
      </div>
    )
  };