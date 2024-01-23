import { ApiPromise } from '@polkadot/api'
import {
  BrokerConstantsType,
  ConfigurationType,
  SaleInfoType,
  StatusType,
  blockTimeToUTC,
  blocksToTimeFormat,
  getConstants,
  getCurrentBlockNumber,
  useInkathon,
} from '@poppyseed/lastic-sdk'
import { useEffect, useMemo, useState } from 'react'

// Define a type for the queryParams
type QueryParams = (string | number | Record<string, unknown>)[]

const typeOfChain: 'PARA' | 'RELAY' | 'LOCAL' = 'PARA'

// Custom hook for querying substrate state
function useSubstrateQuery(
  api: ApiPromise | undefined,
  queryKey: string,
  queryParams: QueryParams = [],
) {
  const [data, setData] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (api?.query?.broker?.[queryKey]) {
        try {
          const result = await api.query.broker[queryKey](...queryParams)
          // Check if the Option type is Some and unwrap the value
          if (result) {
            setData(result.toString())
          } else {
            setData(null)
          }
        } catch (error) {
          console.error(`Failed to fetch ${queryKey}:`, error)
        }
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 5000)

    return () => clearInterval(intervalId)
  }, [api, queryKey, queryParams])

  return data
}

function useCurrentBlockNumber(api: ApiPromise | undefined) {
  const [currentBlockNumber, setCurrentBlockNumber] = useState(0)

  useEffect(() => {
    if (!api) return

    const fetchCurrentBlockNumber = async () => {
      const currentBlock = await getCurrentBlockNumber(api)
      setCurrentBlockNumber(currentBlock)
    }

    const intervalId = setInterval(fetchCurrentBlockNumber, 1000) // Update every second

    return () => clearInterval(intervalId)
  }, [api])

  return currentBlockNumber
}

function useBrokerConstants(api: ApiPromise | undefined) {
  const [brokerConstants, setBrokerConstants] = useState<BrokerConstantsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchConstants = async () => {
      try {
        const constants = await getConstants(api)
        if (isMounted) {
          setBrokerConstants(constants)
          setIsLoading(false)
        }
      } catch (err) {
        console.error(err)
        setIsLoading(false)
      }
    }

    fetchConstants()

    return () => {
      isMounted = false
    }
  }, [api])

  return { brokerConstants, isLoading }
}

function saleStatus(
  currentBlockNumber: number,
  saleInfo: SaleInfoType,
  config: ConfigurationType,
  constant: BrokerConstantsType,
) {
  const divide_by_2_or_not: 1 | 2 = typeOfChain === 'PARA' ? 2 : 1
  const saleEnds: number =
    saleInfo.saleStart +
    (config.regionLength * constant.timeslicePeriod) / divide_by_2_or_not -
    config.interludeLength

  let statusMessage = ''
  let timeRemaining = ''

  if (currentBlockNumber < saleInfo.saleStart) {
    timeRemaining = blocksToTimeFormat(saleInfo.saleStart - currentBlockNumber, typeOfChain)
    statusMessage = 'Interlude Period - time to renew your core!'
  } else if (currentBlockNumber < saleInfo.saleStart + config.leadinLength) {
    timeRemaining = blocksToTimeFormat(
      saleInfo.saleStart + config.leadinLength - currentBlockNumber,
      typeOfChain,
    )
    statusMessage =
      'Sales have started we are now in the lead-in period. The price is linearly decreasing with each block.'
  } else if (currentBlockNumber <= saleEnds) {
    timeRemaining = blocksToTimeFormat(saleEnds - currentBlockNumber, typeOfChain)
    statusMessage = 'Sale is in the purchase period.'
  } else {
    statusMessage = 'The sale has ended.'
  }

  return { statusMessage, timeRemaining }
}

function calculateCurrentPrice(
  currentBlockNumber: number,
  saleInfo: SaleInfoType,
  config: ConfigurationType,
): number {
  if (
    currentBlockNumber < saleInfo.saleStart + config.leadinLength &&
    currentBlockNumber > saleInfo.saleStart
  ) {
    return saleInfo.price * (2 - (currentBlockNumber - saleInfo.saleStart) / config.leadinLength)
  } else {
    return saleInfo.price
  }
}

function currentRelayBlockUtilization(
  currentRelayBlock: number,
  saleInfo: SaleInfoType,
  constant: BrokerConstantsType,
) {
  const startBlock = saleInfo.regionBegin * constant.timeslicePeriod
  const endBlock = saleInfo.regionEnd * constant.timeslicePeriod
  const percent = (currentRelayBlock - startBlock) / (endBlock - startBlock)
  if (percent < 0) {
    return 0
  } else {
    return percent
  }
}

export default function BrokerSaleInfo() {
  const { api, relayApi } = useInkathon()
  const currentBlockNumber = useCurrentBlockNumber(api)

  const saleInfoString = useSubstrateQuery(api, 'saleInfo')
  const configurationString = useSubstrateQuery(api, 'configuration')
  const statusString = useSubstrateQuery(api, 'status')

  const { brokerConstants, isLoading: isConstantsLoading } = useBrokerConstants(api)

  const saleInfo = useMemo(
    () => (saleInfoString ? (JSON.parse(saleInfoString) as SaleInfoType) : null),
    [saleInfoString],
  )
  const configuration = useMemo(
    () => (configurationString ? (JSON.parse(configurationString) as ConfigurationType) : null),
    [configurationString],
  )
  const status = useMemo(
    () => (statusString ? (JSON.parse(statusString) as StatusType) : null),
    [statusString],
  )

  // Update saleStage every second based on the currentBlockNumber
  const [saleStage, setSaleStage] = useState('')
  const [timeRemaining, setTimeRemaining] = useState('')
  useEffect(() => {
    if (saleInfo && configuration && brokerConstants) {
      const { statusMessage, timeRemaining } = saleStatus(
        currentBlockNumber,
        saleInfo,
        configuration,
        brokerConstants,
      )
      setTimeRemaining(timeRemaining)
      setSaleStage(statusMessage)
    }
  }, [currentBlockNumber, saleInfo, configuration, brokerConstants])

  const [regionBeginTimestamp, setRegionBeginTimestamp] = useState<string>('')
  const [regionEndTimestamp, setRegionEndTimestamp] = useState<string>('')
  const [currentRelayBlock, setCurrentRelayBlock] = useState<number | null>(null)

  useEffect(() => {
    const fetchRegionTimestamps = async () => {
      try {
        if (saleInfo && brokerConstants) {
          const beginTimestamp = relayApi
            ? await blockTimeToUTC(relayApi, saleInfo.regionBegin * brokerConstants.timeslicePeriod)
            : ''
          const endTimestamp = relayApi
            ? await blockTimeToUTC(relayApi, saleInfo.regionEnd * brokerConstants.timeslicePeriod)
            : ''
          const getCurrentRelayBlock = relayApi ? await getCurrentBlockNumber(relayApi) : null

          setRegionBeginTimestamp(beginTimestamp)
          setRegionEndTimestamp(endTimestamp)
          setCurrentRelayBlock(getCurrentRelayBlock)
        }
      } catch (error) {
        console.error('Error fetching block timestamp:', error)
      }
    }

    fetchRegionTimestamps()
  }, [relayApi, saleInfo, brokerConstants])

  if (!api || !relayApi) return <div>API not available</div>

  if (
    !saleInfo ||
    !configuration ||
    !status ||
    !currentRelayBlock ||
    !brokerConstants ||
    isConstantsLoading
  ) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="mb-4 p-10">
        <button className="font-bold">
          <span className="text-pink-4">◀</span> previous coretime sale
        </button>
        <div className="flex justify-between rounded-full mx-10 bg-pink-4 px-16 py-10 bg-opacity-30 items-center my-6">
          <div className="text-xl font-bold font-syncopate text-gray-21">Renewal period</div>
          <div className="text-2xl font-bold font-syncopate text-gray-18">{timeRemaining}</div>
        </div>
      </div>

      <h2>
        <b>Sale Info:</b>
      </h2>
      <div>availableCores: {saleInfo.coresOffered - saleInfo.coresSold}</div>
      <div>
        coresSold: {saleInfo.coresSold} / {saleInfo.coresOffered}
      </div>
      <div>currentPrice: {calculateCurrentPrice(currentBlockNumber, saleInfo, configuration)}</div>
      <div>{saleStage}</div>
      <div>
        Amount of utilization:{' '}
        {currentRelayBlockUtilization(currentRelayBlock, saleInfo, brokerConstants)} % current relay
        block: {currentRelayBlock}
        start region block: {saleInfo.regionBegin * brokerConstants.timeslicePeriod}
        end region block: {saleInfo.regionEnd * brokerConstants.timeslicePeriod}
        Region Begin Timestamp:{' '}
        {regionBeginTimestamp !== null ? regionBeginTimestamp : 'Loading...'}
        Region End Timestamp: {regionEndTimestamp !== null ? regionEndTimestamp : 'Loading...'}
      </div>
      <div>How many cores are set to renew by default?</div>
      <div>
        idealCoresSold: {saleInfo.idealCoresSold}
        firstCore: {saleInfo.firstCore}
        selloutPrice: {saleInfo.selloutPrice}
        renewalBump: {configuration.renewalBump}
      </div>
      <div>
        <b>Configuration:</b>
      </div>
      <div>
        idealBulkProportion: {configuration.idealBulkProportion}
        limitCoresOffered: {configuration.limitCoresOffered}
        contributionTimeout: {configuration.contributionTimeout}
      </div>
    </div>
  )
}
