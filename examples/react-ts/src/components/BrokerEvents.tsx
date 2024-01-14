import {
  ConfigurationType,
  LeasesType,
  SaleInfoType,
  StatusType,
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

export default function BrokerEvents() {
  const saleInfoString: string | null = useSubstrateQuery('saleInfo');
  const saleInfo: SaleInfoType | null = saleInfoString ? JSON.parse(saleInfoString) as SaleInfoType : null;
  const configurationString: string | null = useSubstrateQuery('configuration');
  const configuration: ConfigurationType | null = configurationString ? JSON.parse(configurationString) as ConfigurationType : null;
  const statusString: string | null = useSubstrateQuery('status');
  const status: StatusType | null = statusString ? JSON.parse(statusString) as StatusType : null;
  const leasesString: string | null = useSubstrateQuery('leases');
  const leases: LeasesType | null = leasesString ? JSON.parse(leasesString) as LeasesType : null;
  const reservations = useSubstrateQuery('reservations');
  const palletVersion = useSubstrateQuery('palletVersion');
  const instaPoolIo = useSubstrateQuery('instaPoolIo', ['']);
  const allowedRenewals = useSubstrateQuery('allowedRenewals', ['']);
  const instaPoolContribution = useSubstrateQuery('instaPoolContribution', ['']);
  const instaPoolHistory = useSubstrateQuery('instaPoolHistory', ['']);
  const workload = useSubstrateQuery('workload', ['']);
  let regionId = { begin: '214', core: '0', mask: '0xffffffffffffffffffff' };
  const regionData = useSubstrateQuery('regions', [regionId]);

  return (
    <div>
      <div><b>Sale Info:</b></div>
      <div>
        {saleInfo ? `
        coresSold: ${saleInfo.coresSold} out of ${saleInfo.coresOffered} available
          saleStart: ${saleInfo.saleStart}
          leadinLength: ${saleInfo.leadinLength}
          price: ${saleInfo.price}
          regionBegin: ${saleInfo.regionBegin}
          regionEnd: ${saleInfo.regionEnd}
          idealCoresSold: ${saleInfo.idealCoresSold}
          firstCore: ${saleInfo.firstCore}
          selloutPrice: ${saleInfo.selloutPrice}
          `
         : (
          "None"
        )}
      </div>
      <div><b>Configuration:</b></div>
      <div>
        {configuration ? (
          Object.entries(configuration).map(([key, value]) => (
            <div key={key}>{`${key}: ${value}`}</div>
          ))
        ) : (
          "None"
        )}
      </div>      
      <div><b>Status:</b></div>
      <div>
        {status ? (
          Object.entries(status).map(([key, value]) => (
            <div key={key}>{`${key}: ${value}`}</div>
          ))
        ) : (
          "None"
        )}
      </div>
      <div>Leases:</div>
      <div>{leasesString || "None"}</div>
      <div>Reservations:</div>
      <div>{reservations || "None"}</div>
      <div>Pallet Version:</div>
      <div>{palletVersion || "None"}</div>
      <div>Insta Pool Io</div>
      <div>{instaPoolIo || "None"}</div>
      <div>Allowed Renewals</div>
      <div>{allowedRenewals || "None"}</div>
      <div>Insta Pool Contribution</div>
      <div>{instaPoolContribution || "None"}</div>
      <div>Insta Pool History</div>
      <div>{instaPoolHistory || "None"}</div>
      <div>Workload</div>
      <div>{workload || "None"}</div>
      <div>Region Data:</div>
      <div>{regionData || "No data for this region"}</div>
    </div>
  )
};    