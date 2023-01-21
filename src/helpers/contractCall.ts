import { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import {
  ContractCallOutcome,
  ContractOptions,
} from '@polkadot/api-contract/types'
import { Callback, ISubmittableResult } from '@polkadot/types/types'
import { BN, stringCamelCase } from '@polkadot/util'

/**
 * Performs a dry run for the given contract method and arguments.
 * Is used within `contractQuery` & `contractTx` for gas estimation.
 */
export const contractCallDryRun = async (
  api: ApiPromise,
  userAddress: string,
  contract: ContractPromise,
  method: string,
  options = {} as ContractOptions,
  args = [] as unknown[],
): Promise<ContractCallOutcome> => {
  const abiMessage = contract.abi.messages.find((m) => m.method === method)
  if (!abiMessage) {
    throw new Error(`"${method}" not found in Contract`)
  }

  const { value, gasLimit, storageDepositLimit } = options
  const result = await api.call.contractsApi.call<ContractCallOutcome>(
    userAddress,
    contract.address,
    value ?? new BN(0),
    gasLimit ?? null,
    storageDepositLimit ?? null,
    abiMessage.toU8a(args),
  )

  return result
}

/**
 * Calls a given non-mutating contract method (query) with upfront gas estimation.
 */
export const contractQuery = async (
  api: ApiPromise,
  userAddress: string,
  contract: ContractPromise,
  method: string,
  options = {} as ContractOptions,
  args = [] as unknown[],
): Promise<ContractCallOutcome> => {
  // Dry run
  delete options.gasLimit
  const { gasRequired } = await contractCallDryRun(
    api,
    userAddress,
    contract,
    method,
    options,
    args,
  )

  // Call actual query/tx
  const queryFn = contract.query[stringCamelCase(method)]
  return await queryFn(
    userAddress,
    { ...options, gasLimit: gasRequired },
    ...args,
  )
}

/**
 * Calls a given mutating contract method (tx) with upfront gas estimation.
 */
export const contractTx = async (
  api: ApiPromise,
  userAddress: string,
  contract: ContractPromise,
  method: string,
  options = {} as ContractOptions,
  args = [] as unknown[],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  statusCb = (() => {}) as Callback<ISubmittableResult>,
) => {
  // Dry run
  delete options.gasLimit
  const { gasRequired } = await contractCallDryRun(
    api,
    userAddress,
    contract,
    method,
    options,
    args,
  )

  // Call actual query/tx
  const txFn = contract.tx[stringCamelCase(method)]
  return await txFn({ ...options, gasLimit: gasRequired }, ...args).signAndSend(
    userAddress,
    statusCb,
  )
}
