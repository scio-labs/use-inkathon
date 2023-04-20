import { ApiPromise } from '@polkadot/api'
import { ContractPromise } from '@polkadot/api-contract'
import {
  ContractCallOutcome,
  ContractOptions,
} from '@polkadot/api-contract/types'
import { EventRecord } from '@polkadot/types/interfaces'
import {
  Callback,
  IKeyringPair,
  ISubmittableResult,
} from '@polkadot/types/types'
import { BN, stringCamelCase } from '@polkadot/util'
import { decodeOutput } from './decodeOutput'
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
 * Calls a given mutating contract method (tx) and wraps it in a promise.
 * Before, a dry run is performed to determine the required gas & potential errors.
 */
export type ContractTxResult = {
  dryResult: ContractCallOutcome
  result?: ISubmittableResult
  errorMessage?: string | 'UserCancelled' | 'ExtrinsicFailed' | 'Error'
  errorEvent?: EventRecord
}
export const contractTx = async (
  api: ApiPromise,
  account: IKeyringPair | string,
  contract: ContractPromise,
  method: string,
  options = {} as ContractOptions,
  args = [] as unknown[],
  statusCb?: Callback<ISubmittableResult>,
): Promise<ContractTxResult> => {
  // Dry run to determine required gas and potential errors
  delete options.gasLimit
  const dryResult = await contractCallDryRun(
    api,
    account,
    contract,
    method,
    options,
    args,
  )
  const { isError, decodedOutput } = decodeOutput(dryResult, contract, method)
  if (isError)
    return Promise.reject({
      dryResult,
      errorMessage: decodedOutput || 'Error',
    })

  // Call actual query/tx & wrap it in a promise
  const gasLimit = dryResult.gasRequired
  return new Promise(async (resolve, reject) => {
    const tx = contract.tx[stringCamelCase(method)](
      { ...options, gasLimit },
      ...args,
    )
    try {
      const unsub = await tx.signAndSend(account, (result) => {
        statusCb?.(result)
        const isInBlock = result?.status?.isInBlock
        if (!isInBlock) return
        const errorEvent = result?.events.find(
          ({ event: { method } }: any) => method === 'ExtrinsicFailed',
        )
        if (isInBlock && errorEvent) {
          // Reject if `ExtrinsicFailed` event was found
          reject({
            dryResult,
            errorMessage: decodeOutput || 'ExtrinsicFailed',
            errorEvent,
          })
          unsub?.()
        } else if (isInBlock) {
          // Otherwise resolve succesfully if transaction is in block
          resolve({ dryResult, result })
          unsub?.()
        }
      })
    } catch (e) {
      console.error('Error while performing transaction:', e)
      // Assume transaction was cancelled by user
      reject({ errorMessage: 'UserCancelled' })
    }
  })
}
