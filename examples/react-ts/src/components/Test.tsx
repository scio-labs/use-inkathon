import {
  BrokerConstantsType,
  getConstants
} from '@poppyseed/lastic-sdk'

export function Test() {
  const brokerConstants: BrokerConstantsType | null = getConstants()
  
  if (brokerConstants === null) {
    return (
      <div>
        <h3>Broker Constants:</h3>
        <pre>not connected</pre>
        <h3>Broker Extrinsics:</h3>
        <pre>not connected</pre>
      </div>
    )
  }

  return (
    <div>
        <h3>Broker Constants:</h3>
        <p>PalletId: {brokerConstants.palletId}</p>
        <p>Timeslice Period: {brokerConstants.timeslicePeriod}</p>
        <p>Max Leased Cores: {brokerConstants.maxLeasedCores}</p>
        <p>Max reserved Cores: {brokerConstants.maxReservedCores}</p>
        <h3>Broker Extrinsics:</h3>

    </div>
  )
}
