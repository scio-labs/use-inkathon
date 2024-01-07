import { BrokerConstantsType, getConstants } from '@poppyseed/lastic-sdk'

export function Test() {
  const brokerConstants: BrokerConstantsType | null = getConstants()
  console.log("broker const: :", brokerConstants)


  return (
    <div>
        <h3>Broker Constants:</h3>
        <pre>{JSON.stringify(brokerConstants, null, 2)}</pre>
    </div>
  )
}
