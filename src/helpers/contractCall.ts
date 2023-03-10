import { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import {
  ContractCallOutcome,
  ContractOptions,
} from '@polkadot/api-contract/types'
import {
  Callback,
  IKeyringPair,
  ISubmittableResult,
} from '@polkadot/types/types'
import { BN, stringCamelCase } from '@polkadot/util'
import { getAbiMessage } from './getAbiMessage'
import { getMaxGasLimit } from './getGasLimit'

/**
 * Performs a dry run for the given contract method and arguments.
 * Is used within `contractQuery` & `contractTx` for gas estimation.
 */
export const contractCallDryRun = async (
  api: ApiPromise,
  account: IKeyringPair | string,
  contract: ContractPromise,
  method: string,
  options = {} as ContractOptions,
  args = [] as unknown[],
): Promise<ContractCallOutcome> => {
  const abiMessage = getAbiMessage(contract, method)
  const address = (account as IKeyringPair)?.address || account
  const { value, gasLimit, storageDepositLimit } = options
  const result = await api.call.contractsApi.call<ContractCallOutcome>(
    address,
    contract.address,
    value ?? new BN(0),
    gasLimit ?? null,
    storageDepositLimit ?? null,
    abiMessage.toU8a(args),
  )

  return result
}

/**
 * Calls a given non-mutating contract method (query) with maximum possible gas limit.
 */
export const contractQuery = async (
  api: ApiPromise,
  address: string,
  contract: ContractPromise,
  method: string,
  options = {} as ContractOptions,
  args = [] as unknown[],
): Promise<ContractCallOutcome> => {
  // HACK: This should be possible by setting the `gasLimit` to null or -1 in the future.
  const gasLimit = getMaxGasLimit(api)

  // Call actual query/tx
  const queryFn = contract.query[stringCamelCase(method)]
  return await queryFn(address, { ...options, gasLimit }, ...args)
}

/**
 * Calls a given mutating contract method (tx) with upfront gas estimation.
 */
export const contractTx = async (
  api: ApiPromise,
  account: IKeyringPair | string,
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
    account,
    contract,
    method,
    options,
    args,
  )

  // Call actual query/tx
  const txFn = contract.tx[stringCamelCase(method)]
  return await txFn({ ...options, gasLimit: gasRequired }, ...args).signAndSend(
    account,
    statusCb,
  )
}
