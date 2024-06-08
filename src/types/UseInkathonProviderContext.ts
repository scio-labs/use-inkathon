import { SubstrateChain, SubstrateWallet } from '@/types'
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api'
import { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types'
import { Signer } from '@polkadot/types/types'
import { Dispatch, SetStateAction } from 'react'
import { SubstrateDeployment } from './SubstrateDeployment'

export type Toast = {
  id: number
  title?: string
  link?: string
  duration?: number
  type: ToastType
}

export type ToastType = 'success' | 'error' | 'loading' | 'canceled';

export type UseInkathonProviderContextType = {
  isInitializing?: boolean
  isInitialized?: boolean
  isConnecting?: boolean
  isConnected?: boolean
  error?: UseInkathonError
  activeChain?: SubstrateChain
  activeRelayChain?: SubstrateChain
  switchActiveChain?: (chain: SubstrateChain, relayChain: SubstrateChain) => Promise<void>
  api?: ApiPromise
  relayApi?: ApiPromise
  provider?: WsProvider | HttpProvider
  relayProvider?: WsProvider | HttpProvider
  connect?: (
    chain?: SubstrateChain,
    relayChain?: SubstrateChain,
    wallet?: SubstrateWallet,
    lastActiveAccountAddress?: string,
  ) => Promise<void>
  disconnect?: () => void
  accounts?: InjectedAccount[]
  activeAccount?: InjectedAccount
  activeExtension?: InjectedExtension
  activeSigner?: Signer
  setActiveAccount?: Dispatch<SetStateAction<InjectedAccount | undefined>>
  lastActiveAccount?: InjectedAccount
  deployments?: SubstrateDeployment[]
  toasts: Toast[]
  setToasts: (toasts: Toast[]) => void
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: Toast['id']) => void
}

export interface UseInkathonError {
  code: UseInkathonErrorCode
  message: string
}

export enum UseInkathonErrorCode {
  InitializationError,
  NoSubstrateExtensionDetected,
  NoAccountInjected,
}
