import { ApiPromise } from '@polkadot/api';
import {
    ConfigurationType,
    SaleInfoType,
    StatusType,
    getCurrentBlockNumber,
    useInkathon
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
  
      fetchCurrentBlockNumber();
    }, [api]);
  
    return currentBlockNumber;
  }

  function saleStatus(currentBlockNumber: number, saleInfo: SaleInfoType, config: ConfigurationType): string {
    if (currentBlockNumber < saleInfo.saleStart) {
      return `Sale hasn't started yet. It will start in ${saleInfo.saleStart - currentBlockNumber} blocks.`;
    } else if (currentBlockNumber >= saleInfo.saleStart && currentBlockNumber < saleInfo.saleStart + config.leadinLength) {
      return `Sale is in the lead-in period. Purchase period starts in ${saleInfo.saleStart + config.leadinLength - currentBlockNumber} blocks.`;
    } else if (currentBlockNumber >= saleInfo.saleStart + config.leadinLength && currentBlockNumber <= saleInfo.saleStart + config.regionLength) {
      return `Sale is in the purchase period. Sale ends in ${saleInfo.saleStart + config.regionLength - currentBlockNumber} blocks.`;
    } else {
      return `The sale has ended.`;
    }
  }
  
  
  export default function BrokerSaleInfo() {
    const { api } = useInkathon();
    if (!api) return;
    const currentBlockNumber = useCurrentBlockNumber(api);

    const saleInfoString = useSubstrateQuery(api, 'saleInfo');
    const configurationString = useSubstrateQuery(api, 'configuration');
    const statusString = useSubstrateQuery(api, 'status');
  
    const saleInfo = useMemo(() => saleInfoString ? JSON.parse(saleInfoString) as SaleInfoType : null, [saleInfoString]);
    const configuration = useMemo(() => configurationString ? JSON.parse(configurationString) as ConfigurationType : null, [configurationString]);
    const status = useMemo(() => statusString ? JSON.parse(statusString) as StatusType : null, [statusString]);

    if (
      !saleInfo ||
      !configuration || 
      !status
      ) {
      return <div>Loading...</div>;
    }

    const saleHasStarted = currentBlockNumber >= saleInfo.saleStart;
    const blocksUntilSaleStarts = saleHasStarted ? 0 : saleInfo.saleStart - currentBlockNumber;
    const saleStartTime = blocksUntilSaleStarts; // Replace with actual conversion logic if needed
  
    const saleStage = saleStatus(currentBlockNumber, saleInfo, configuration);

  
    return (
      <div>
        <h2><b>Sale Info:</b></h2>
        <div>
          coresSold: {saleInfo.coresSold} out of {saleInfo.coresOffered} available
        </div>
        <div>
            saleStart: {saleInfo.saleStart}
            saleEnd: {saleInfo.saleStart + configuration?.regionLength}
        </div>
        <div>
            currentTime: {currentBlockNumber}
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