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
  
      const intervalId = setInterval(fetchCurrentBlockNumber, 1000); // Update every second
  
      return () => clearInterval(intervalId);
    }, [api]);
  
    return currentBlockNumber;
  }

  
  function blocksToTimeFormat(blocks: number): string {
    // Assuming each block takes X seconds, adjust this according to your blockchain's specifications
    const secondsPerBlock = 3; 
    const totalSeconds = blocks * secondsPerBlock;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours === 0 && minutes === 0) {
      return `${seconds}s`;
    } else if (hours === 0) {
        return `${minutes}m ${seconds}s`;
    } else {  
    return `${hours}h ${minutes}m ${seconds}s`
    };
  }
  
  function saleStatus(currentBlockNumber: number, saleInfo: SaleInfoType, config: ConfigurationType): string {
    if (currentBlockNumber < saleInfo.saleStart) {
      const timeUntilStart = blocksToTimeFormat(saleInfo.saleStart - currentBlockNumber);
      return `Sale hasn't started yet. It will start in ${timeUntilStart}.`;
    } else if (currentBlockNumber < saleInfo.saleStart + config.leadinLength) {
      const timeUntilPurchase = blocksToTimeFormat(saleInfo.saleStart + config.leadinLength - currentBlockNumber);
      return `Sale is in the lead-in period. Price is linearaly decreasing, purchase period ends in ${timeUntilPurchase}.`;
    } else if (currentBlockNumber <= saleInfo.saleStart + config.regionLength) {
      const timeUntilEnd = blocksToTimeFormat(saleInfo.saleStart + config.regionLength - currentBlockNumber);
      return `Sale is in the purchase period. Sale ends in ${timeUntilEnd}.`;
    } else {
      return `The sale has ended.`;
    }
  }

  function calculateCurrentPrice(currentBlockNumber: number, saleInfo: SaleInfoType, config: ConfigurationType): number {
    if (currentBlockNumber < saleInfo.saleStart) {
      return 0;
    } else if (currentBlockNumber < saleInfo.saleStart + config.leadinLength) {
      return saleInfo.price * (2 - (currentBlockNumber - saleInfo.saleStart) / config.leadinLength);
    } else if (currentBlockNumber <= saleInfo.saleStart + config.regionLength) {
      return saleInfo.price;
    } else {
      return saleInfo.selloutPrice? saleInfo.selloutPrice : 0;
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

    // Update saleStage every second based on the currentBlockNumber
    const [saleStage, setSaleStage] = useState('');
    useEffect(() => {
        if (saleInfo && configuration) {
        setSaleStage(saleStatus(currentBlockNumber, saleInfo, configuration));
        }
    }, [currentBlockNumber, saleInfo, configuration]);


    if (
      !saleInfo ||
      !configuration || 
      !status
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
            saleStart: {saleInfo.saleStart}
            saleEnd: {saleInfo.saleStart + configuration?.regionLength}
        </div>
        <div>
            currentTime: {currentBlockNumber}
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