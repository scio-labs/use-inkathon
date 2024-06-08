import { Toast } from '@/types'
import { ApiPromise, SubmittableResult } from '@polkadot/api'
import { DispatchError } from '@polkadot/types/interfaces'
import { bnFromHex } from '@polkadot/util'
import { Dispatch, SetStateAction } from 'react'

const txResHandler = (
  setStatus: Dispatch<SetStateAction<string | null>>,
  api: ApiPromise,
  addToast: (toast: Omit<Toast, 'id'>) => void,
  result: SubmittableResult,
) => {
  const { events, status } = result
  const txHash = result.txHash.toString()

  if (status.isBroadcast) {
    setStatus(`Broadcasted ${txHash}`)
    addToast({ title: `Tx broadcasted`, type: 'loading' })
  }

  if (status.isInBlock) {
    setStatus(`Included at block hash ${status.asInBlock.toHex()}`)
    console.log('Included at block hash', status.asInBlock.toHex())
    addToast({ title: `Included at block hash ${status.asInBlock.toHex()}`, type: 'loading' })
  } else if (status.isFinalized) {
    setStatus(`😉 Finalized. Block hash: ${status.asFinalized.toString()}`)
    console.log('Finalized at block hash', status.asFinalized.toHex())
    addToast({ title: `❤️️ Transaction successful! tx hash: ${txHash} , Block hash: ${status.asFinalized.toString()}`, type: 'success' })
  }

  // status.isFinalized
  //   ? setStatus(`😉 Finalized. Block hash: ${status.asFinalized.toString()}`)
  //   : setStatus(`Current transaction status: ${status.type}`)

  // Loop through Vec<EventRecord> to display all events
  events.forEach(({ event: { data, method, section } }) => {
    if (section + ':' + method === 'system:ExtrinsicFailed') {
      // extract the data for this event
      const [dispatchError, dispatchInfo] = data
      console.log(`dispatchinfo: ${dispatchInfo}`)
      let errorInfo

      // decode the error
      if ((dispatchError as DispatchError).isModule) {
        // for module errors, we have the section indexed, lookup
        // (For specific known errors, we can also do a check against the
        // api.errors.<module>.<ErrorName>.is(dispatchError.asModule) guard)
        const mod = (dispatchError as DispatchError).asModule
        const error = api.registry.findMetaError(
          new Uint8Array([
            mod.index.toNumber(),
            bnFromHex(mod.error.toHex().slice(0, 4)).toNumber(),
          ]),
        )
        const message = `${error.section}.${error.name}${
          Array.isArray(error.docs) ? `(${error.docs.join('')})` : error.docs || ''
        }`

        errorInfo = `${message}`
        console.log(`Error-info::${JSON.stringify(error)}`)
      } else {
        // Other, CannotLookup, BadOrigin, no extra info
        errorInfo = dispatchError.toString()
      }
      setStatus(`😞 Transaction Failed! ${section}.${method}::${errorInfo}`)
      addToast({ title: `😞 Transaction Failed! ${section}.${method}::${errorInfo}`, type: 'error' })
    } else if (section + ':' + method === 'system:ExtrinsicSuccess') {
      if (status.isFinalized) {
        // setStatus(`😉 Finalized. Block hash: ${status.asFinalized.toString()}`)
        // console.log('Finalized at block hash', status.asFinalized.toHex())
      
        setStatus(
          `❤️️ Transaction successful! tx hash: ${txHash} , Block hash: ${status.asFinalized.toString()}`,
        )
      }
    }
  })
}

const txErrHandler = (
  setStatus: Dispatch<SetStateAction<string | null>>,
  addToast: (toast: Omit<Toast, 'id'>) => void,
  err: any
) => {
  setStatus(`😞 Transaction Failed: ${err.toString()}`)
  addToast({ title: `😞 Transaction Failed: ${err.toString()}`, type: 'canceled' })
}

const queryResHandler = (setStatus: Dispatch<SetStateAction<string | null>>, result: any) => {
  result.isNone ? setStatus('None') : setStatus(result.toString())
}

export { queryResHandler, txErrHandler, txResHandler }
