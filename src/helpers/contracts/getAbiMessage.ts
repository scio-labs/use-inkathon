import { ContractPromise } from '@polkadot/api-contract'
import { stringCamelCase } from '@polkadot/util'

/**
 * Returns the ABI message for the given method name within the given contract.
 */
export const getAbiMessage = (contract: ContractPromise, method: string) => {
  const abiMessage = contract.abi.messages.find(
    (m) => stringCamelCase(m.method) === stringCamelCase(method),
  )
  if (!abiMessage) {
    throw new Error(`"${method}" not found in Contract`)
  }
  return abiMessage
}
