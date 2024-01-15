import {
    ConfigurationType,
    SaleInfoType,
    StatusType,
    getCurrentBlockNumber,
    useInkathon
} from '@poppyseed/lastic-sdk';
import { useEffect, useState } from 'react';
  
  // Define a type for the queryParams
  type QueryParams = (string | number | Record<string, unknown>)[];
  
// Custom hook for querying substrate state
function useSubstrateQuery(queryKey: string, queryParams: QueryParams = []) {
    const { api } = useInkathon();
  
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
  
  export default function BrokerSaleInfo() {
    const { api } = useInkathon();

    const saleInfoString: string | null = useSubstrateQuery('saleInfo');
    const saleInfo: SaleInfoType | null = saleInfoString ? JSON.parse(saleInfoString) as SaleInfoType : null;
    const configurationString: string | null = useSubstrateQuery('configuration');
    const configuration: ConfigurationType | null = configurationString ? JSON.parse(configurationString) as ConfigurationType : null;
    const statusString: string | null = useSubstrateQuery('status');
    const status: StatusType | null = statusString ? JSON.parse(statusString) as StatusType : null;
  
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
  
    useEffect(() => {
        if (!api) return;
    
        const fetchCurrentBlockNumber = async () => {
          const currentBlock = await getCurrentBlockNumber(api);
          setCurrentBlockNumber(currentBlock);
        };
    
        fetchCurrentBlockNumber();
      }, [api]);
  

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
            {saleHasStarted ? (
            <p>The sale has already started.</p>
            ) : (
            <p>The sale will start in {saleStartTime} blocks.</p>
            )}
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