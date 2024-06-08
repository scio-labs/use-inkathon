import { Toast } from '@/types'
import { signedTx, unsignedTx } from '@/utils'
import { ApiPromise } from '@polkadot/api'
import { InjectedAccount } from '@polkadot/extension-inject/types'
import { Signer } from '@polkadot/types/types'
import { useState } from 'react'

export interface TxButtonProps {
  api: ApiPromise | undefined
  setStatus: (status: string | null) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  attrs: {
    palletRpc: string
    callable: string
    inputParams: any[]
    paramFields: any[]
  }
  type: 'SIGNED-TX' | 'UNSIGNED-TX'
  activeAccount: InjectedAccount | undefined
  activeSigner: Signer | undefined
}

interface UseTxButtonResult {
  transaction: () => Promise<void>
  status: string | null
  allParamsFilled: () => boolean
}

export const useTxButton = ({
  api,
  addToast,
  attrs,
  type,
  activeAccount,
  activeSigner,
}: TxButtonProps): UseTxButtonResult => {
  const [status, setStatus] = useState<string | null>(null)
  const [unsub, setUnsub] = useState<(() => void) | null>(null)

  const isUnsigned = () => type === 'UNSIGNED-TX'
  const isSigned = () => type === 'SIGNED-TX'

  // Main transaction handler
  const transaction = async () => {
    // Unsubscribe if there's an existing subscription
    if (typeof unsub === 'function') {
      unsub()
      setUnsub(null)
    }

    setStatus('Sending...')

    // Check if API, account, and signer are present
    if (!api || !activeAccount || !activeSigner) {
      setStatus('Error: API, account or signer not present')
      return
    }

    // Call the appropriate transaction function based on the type
    try {
      if (isSigned()) {
        await signedTx(api, attrs, setStatus, addToast, setUnsub, activeAccount, activeSigner)
      } else if (isUnsigned()) {
        await unsignedTx(api, attrs, setStatus, addToast, setUnsub)
      }
    } catch (error) {
      setStatus(`Transaction Failed: ${error}`)
      addToast({ title: `Transaction Failed: ${error}`, type: 'error' })
      console.error(error)
    }
  }

  const allParamsFilled = () => {
    // Destructure attrs for clarity
    const { paramFields, inputParams } = attrs

    // Ensure all required parameters are filled
    return paramFields.every((paramField, ind) => {
      const param = inputParams[ind]
      if (paramField.optional) {
        return true
      }
      const value = typeof param === 'object' ? param.value : param
      return value !== null && value !== ''
    })
  }

  // Expose necessary functions and state
  return { transaction, status, allParamsFilled }
}
