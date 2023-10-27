import { ApiPromise } from '@polkadot/api'
import { SubmittableExtrinsicFunction } from '@polkadot/api/types'
import { AccountId, EventRecord } from '@polkadot/types/interfaces'
import { AnyTuple, Callback, IKeyringPair, ISubmittableResult } from '@polkadot/types/types'
import { BN, bnToBn } from '@polkadot/util'
import { checkIfBalanceSufficient } from './checkIfBalanceSufficient'
import { ExstrinsicThrowErrorMessage, getExtrinsicErrorMessage } from './getExtrinsicErrorMessage'

export type TransferBalanceResult = {
  result?: ISubmittableResult
  errorMessage?: ExstrinsicThrowErrorMessage | 'ExtrinsicFailed'
  errorEvent?: EventRecord
}

/**
 * Transfers a given amount of tokens from one account to another.
 */
export const transferBalance = async (
  api: ApiPromise,
  fromAccount: IKeyringPair | string,
  toAddress: string | AccountId,
  amount: bigint | BN | string | number,
  allowDeath?: boolean,
  statusCb?: Callback<ISubmittableResult>,
): Promise<TransferBalanceResult> => {
  const hasSufficientBalance = await checkIfBalanceSufficient(api, fromAccount, amount)
  if (!hasSufficientBalance) {
    return Promise.reject({ errorMessage: 'TokenBelowMinimum' } satisfies TransferBalanceResult)
  }

  return new Promise(async (resolve, reject) => {
    try {
      const transferFn = (api.tx.balances[
        allowDeath ? 'transferAllowDeath' : 'transferKeepAlive'
      ] || api.tx.balances['transfer']) as SubmittableExtrinsicFunction<'promise', AnyTuple>

      const unsub = await transferFn(toAddress, bnToBn(amount)).signAndSend(
        fromAccount,
        (result: ISubmittableResult) => {
          statusCb?.(result)
          const isInBlock = result?.status?.isInBlock
          if (!isInBlock) return
          const errorEvent = result?.events.find(
            ({ event: { method } }: any) => method === 'ExtrinsicFailed',
          )
          if (isInBlock && errorEvent) {
            // Reject if `ExtrinsicFailed` event was found
            reject({ errorMessage: 'ExtrinsicFailed', errorEvent } satisfies TransferBalanceResult)
            unsub?.()
          } else if (isInBlock) {
            // Otherwise resolve succesfully if transaction is in block
            resolve({ result })
            unsub?.()
          }
        },
      )
    } catch (e: any) {
      console.error('Error while transferring balance:', e)
      reject({
        errorMessage: getExtrinsicErrorMessage(e),
        errorEvent: e,
      } satisfies TransferBalanceResult)
    }
  })
}

/**
 * Transfers all available tokens from one account to another.
 */
export const transferFullBalance = async (
  api: ApiPromise,
  fromAccount: IKeyringPair | string,
  toAddress: string | AccountId,
  keepAlive?: boolean,
  statusCb?: Callback<ISubmittableResult>,
): Promise<TransferBalanceResult> => {
  const hasSufficientBalance = await checkIfBalanceSufficient(api, fromAccount)
  if (!hasSufficientBalance) {
    return Promise.reject({ errorMessage: 'TokenBelowMinimum' } satisfies TransferBalanceResult)
  }

  return new Promise(async (resolve, reject) => {
    try {
      const unsub = await api.tx.balances
        .transferAll(toAddress, !!keepAlive)
        .signAndSend(fromAccount, (result: ISubmittableResult) => {
          statusCb?.(result)
          const isInBlock = result?.status?.isInBlock
          if (!isInBlock) return
          const errorEvent = result?.events.find(
            ({ event: { method } }: any) => method === 'ExtrinsicFailed',
          )
          if (isInBlock && errorEvent) {
            // Reject if `ExtrinsicFailed` event was found
            reject({ errorMessage: 'ExtrinsicFailed', errorEvent } satisfies TransferBalanceResult)
            unsub?.()
          } else if (isInBlock) {
            // Otherwise resolve succesfully if transaction is in block
            resolve({ result })
            unsub?.()
          }
        })
    } catch (e: any) {
      console.error('Error while transferring full balance:', e)
      reject({
        errorMessage: getExtrinsicErrorMessage(e),
        errorEvent: e,
      } satisfies TransferBalanceResult)
    }
  })
}
