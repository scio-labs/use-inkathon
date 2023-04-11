import { ApiPromise } from '@polkadot/api'
import { AccountId } from '@polkadot/types/interfaces'
import {
  Callback,
  IKeyringPair,
  ISubmittableResult,
} from '@polkadot/types/types'
import { BN } from '@polkadot/util'

/**
 * Transfers a given amount of tokens from one account to another.
 */
export const transferBalance = async (
  api: ApiPromise,
  fromAccount: IKeyringPair | string,
  toAddress: string | AccountId,
  amount: BN,
  statusCb?: Callback<ISubmittableResult>,
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const unsub = await api.tx.balances
        .transfer(toAddress, amount)
        .signAndSend(fromAccount, (result) => {
          statusCb?.(result)
          const isInBlock = result?.status?.isInBlock
          if (!isInBlock) return
          const errorEvent = result?.events.find(
            ({ event: { method } }: any) => method === 'ExtrinsicFailed',
          )
          if (isInBlock && errorEvent) {
            // Reject if `ExtrinsicFailed` event was found
            reject({
              errorMessage: 'ExtrinsicFailed',
              errorEvent,
            })
            unsub?.()
          } else if (isInBlock) {
            // Otherwise resolve succesfully if transaction is in block
            resolve({ result })
            unsub?.()
          }
        })
    } catch (e) {
      // Reject if user cancelled with `UserCancelled`
      reject({ errorMessage: 'UserCancelled' })
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
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const unsub = await api.tx.balances
        .transferAll(toAddress, !!keepAlive)
        .signAndSend(fromAccount, (result) => {
          statusCb?.(result)
          const isInBlock = result?.status?.isInBlock
          if (!isInBlock) return
          const errorEvent = result?.events.find(
            ({ event: { method } }: any) => method === 'ExtrinsicFailed',
          )
          if (isInBlock && errorEvent) {
            // Reject if `ExtrinsicFailed` event was found
            reject({
              errorMessage: 'ExtrinsicFailed',
              errorEvent,
            })
            unsub?.()
          } else if (isInBlock) {
            // Otherwise resolve succesfully if transaction is in block
            resolve({ result })
            unsub?.()
          }
        })
    } catch (e) {
      console.error(e)
      // Reject if user cancelled with `UserCancelled`
      reject({ errorMessage: 'UserCancelled' })
    }
  })
}
