import { Toast } from '@/types'
import { ApiPromise, SubmittableResult } from '@polkadot/api'
import { InjectedAccount } from '@polkadot/extension-inject/types'
import { Signer } from '@polkadot/types/types'
import { Dispatch, SetStateAction } from 'react'
import { transformParams } from './broker'
import { txErrHandler, txResHandler } from './broker_handler'

export interface CurrentAccount {
  address: string
  meta: {
    source: string
    isInjected: boolean
  }
}

interface TransactionParams {
  palletRpc: string
  callable: string
  inputParams: any[]
  paramFields: any[]
}

const signedTx = async (
  api: ApiPromise,
  { palletRpc, callable, inputParams, paramFields }: TransactionParams,
  setStatus: Dispatch<SetStateAction<string | null>>,
  addToast: (toast: Omit<Toast, 'id'>) => void,
  setUnsub: Dispatch<SetStateAction<any>>,
  activeAccount: InjectedAccount,
  activeSigner: Signer,
) => {
  const address = activeAccount?.address
  const transformed = transformParams(paramFields, inputParams)

  const txExecute = transformed
    ? api.tx[palletRpc][callable](...transformed)
    : api.tx[palletRpc][callable]()

  const signerOptions = {
    signer: activeSigner,
  }

  const unsub = await txExecute
    .signAndSend(address, signerOptions, (result: SubmittableResult) =>
      txResHandler(setStatus, api, addToast, result),
    )
    .catch((err: Error) => txErrHandler(setStatus, addToast, err))

  setUnsub(() => unsub)
}

const unsignedTx = async (
  api: ApiPromise,
  { palletRpc, callable, inputParams, paramFields }: TransactionParams,
  setStatus: Dispatch<SetStateAction<string | null>>,
  addToast: (toast: Omit<Toast, 'id'>) => void,
  setUnsub: Dispatch<SetStateAction<any>>, // Replace 'any' with a specific type if possible
) => {
  const transformed = transformParams(paramFields, inputParams)

  const txExecute = transformed
    ? api.tx[palletRpc][callable](...transformed)
    : api.tx[palletRpc][callable]()

  const unsub = await txExecute
    .send((result: SubmittableResult) => txResHandler(setStatus, api, addToast, result))
    .catch((err: Error) => txErrHandler(setStatus, addToast, err))

  setUnsub(() => unsub)
}

export { signedTx, unsignedTx }
