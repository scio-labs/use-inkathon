import { BrokerConstantsType, getConstants } from '@scio-labs/use-inkathon'

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
