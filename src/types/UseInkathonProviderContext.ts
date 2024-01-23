import { SubstrateWallet } from '@/types'
import { SubstrateChain } from '@/types/SubstrateChain'
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api'
import { InjectedAccount, InjectedExtension } from '@polkadot/extension-inject/types'
import { Signer } from '@polkadot/types/types'
import { Dispatch, SetStateAction } from 'react'
import { SubstrateDeployment } from './SubstrateDeployment'

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
