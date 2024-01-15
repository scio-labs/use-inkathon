import {
  ConfigurationType,
  InstaPoolIoType,
  LeasesType,
  ReservationsType,
  SaleInfoType,
  StatusType,
  blockTimeToUTC,
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

  const [currentBlockNb, setCurrentBlockNb] = useState(0);

  useEffect(() => {
      if (!api) return;

      const fetchTime = async () => {
          const currentBlock = await getCurrentBlockNumber(api);
          setCurrentBlockNb(currentBlock);
          const blockTimestamp = await blockTimeToUTC(api, 27030);
          console.log(blockTimestamp);

      };

      fetchTime();
  }, [api]);



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
  const reservationsString: string | null = useSubstrateQuery('reservations');
  const reservations: ReservationsType | null = reservationsString ? JSON.parse(reservationsString) as ReservationsType : null;
  const palletVersion = useSubstrateQuery('palletVersion');
  const instaPoolIoString: string | null = useSubstrateQuery('instaPoolIo', ['']);
  const instaPoolIo: InstaPoolIoType | null = instaPoolIoString ? JSON.parse(instaPoolIoString) as InstaPoolIoType : null;
  const allowedRenewals = useSubstrateQuery('allowedRenewals', ['']);
  const instaPoolContribution = useSubstrateQuery('instaPoolContribution', ['']);
  const instaPoolHistory = useSubstrateQuery('instaPoolHistory', ['']);
  const workload = useSubstrateQuery('workload', ['']);
  let regionId = { begin: '214', core: '0', mask: '0xffffffffffffffffffff' };
  const regionData = useSubstrateQuery('regions', [regionId]);

  if (
    !saleInfo ||
    !configuration || 
    !status
    ) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div><b>Sale Info:</b></div>
      <div>
        coresSold: {saleInfo.coresSold} out of {saleInfo.coresOffered} available
      </div>
      <div>
          saleStart: {saleInfo.saleStart}
          saleEnd: {saleInfo.saleStart + configuration?.regionLength}
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
      <div><b>Status:</b></div>
      <div>
        {
          Object.entries(status)
          .map(([key, value]) => (
            <div key={key}>{`${key}: ${value}`}</div>
          ))
        }
      </div>
      <div><b>Leases:</b> (showing only first 5)</div>
      <div>
        {leases ? (
          <ul>
            {leases
            .slice(0,5)
            .map((lease, index) => (
              <li key={index}>
                Until: {lease.until}, Task: {lease.task}
              </li>
            ))}
          </ul>
        ) : (
          <p>No lease data available.</p>
        )} 
      </div>
      <div><b>Reservations:</b></div>
      <div>
        {reservations ? (
          <ul>
            {reservations.map((group, groupIndex) => (
              <li key={groupIndex}>
                {group.map((reservation, reservationIndex) => (
                  <div key={reservationIndex}>
                    Pool / Task: {reservation.assignment?.pool || reservation.assignment?.task}
                    Mask: {reservation.mask}
                  </div>
                ))}
              </li>
            ))}
          </ul>
        ) : (
          <p>No reservation data available.</p>
        )}
      </div>
      <div>Pallet Version: {palletVersion || "None"}</div>
      <div>Insta Pool Io</div>
      <div>
        {instaPoolIo ? (
          <div>
            Private: {instaPoolIo.private}
            System: {instaPoolIo.system}
          </div>
          ) : (
            <p>No insta pool io data available.</p>
          )}
      </div>

      <div> NOT WORKING YET:</div>
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