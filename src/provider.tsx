import { accountArraysAreEqual, accountsAreEqual } from '@helpers'
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api'
import {
  InjectedAccountWithMeta,
  Unsubcall,
} from '@polkadot/extension-inject/types'
import { Signer } from '@polkadot/types/types'
import { registerDeployments, SubstrateDeployment } from '@registry'
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { SubstrateChain } from './chains'

/**
 * Helper Types
 */
export enum UseInkathonErrorCode {
  InitializationError,
  NoSubstrateExtensionDetected,
  NoAccountInjected,
}
export interface UseInkathonError {
  code: UseInkathonErrorCode
  message: string
}

/**
 * UseInkathon Context Type
 */
export type UseInkathonProviderContextType = {
  isConnecting?: boolean
  isConnected?: boolean
  error?: UseInkathonError
  activeChain?: SubstrateChain
  switchActiveChain?: (chain: SubstrateChain) => Promise<void>
  api?: ApiPromise
  provider?: WsProvider | HttpProvider
  connect?: () => Promise<void>
  disconnect?: () => void
  accounts?: InjectedAccountWithMeta[]
  activeAccount?: InjectedAccountWithMeta
  activeSigner?: Signer
  setActiveAccount?: Dispatch<
    SetStateAction<InjectedAccountWithMeta | undefined>
  >
  deployments?: SubstrateDeployment[]
}
export const UseInkathonProviderContext =
  createContext<UseInkathonProviderContextType>({})

/**
 * Primary useInkathon hook that exposes `UseInkathonProviderContext`.
 */
export const useInkathon = () => {
  return useContext(UseInkathonProviderContext)
}

/**
 * Primary useInkathon provider that needs to be wrapped around the app
 * (see documentation) to use `useInkathon` and other hooks anywhere.
 */
export interface UseInkathonProviderProps extends PropsWithChildren {
  appName: string
  defaultChain: SubstrateChain
  connectOnInit?: boolean
  deployments?: Promise<SubstrateDeployment[]>
}
export const UseInkathonProvider: FC<UseInkathonProviderProps> = ({
  children,
  appName,
  defaultChain,
  connectOnInit,
  deployments: _deployments,
}) => {
  const [isConnecting, setIsConnecting] = useState(connectOnInit)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<UseInkathonError | undefined>()
  const [activeChain, setActiveChain] = useState<SubstrateChain>(defaultChain)
  const [api, setApi] = useState<ApiPromise>()
  const [provider, setProvider] = useState<WsProvider | HttpProvider>()
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [activeAccount, setActiveAccount] = useState<InjectedAccountWithMeta>()
  const [activeSigner, setActiveSigner] = useState<Signer>()
  const [unsubscribeAccounts, setUnsubscribeAccounts] = useState<Unsubcall>()
  const [deployments, setDeployments] = useState<SubstrateDeployment[]>([])

  // Register given deployments
  useEffect(() => {
    if (_deployments) registerDeployments(setDeployments, _deployments)
  }, [])

  // Initialize polkadot-js/api
  const initialize = async (autoConnect: boolean, chain: SubstrateChain) => {
    setIsConnected(false)
    setIsConnecting(autoConnect)
    setError(undefined)

    try {
      const provider = new WsProvider(chain.rpcUrls[0])
      setProvider(provider)
      const api = await ApiPromise.create({ provider, noInitWarn: true })
      setApi(api)

      // Update active chain if switching
      if (activeChain.network !== chain.network) setActiveChain(chain)

      // Optionally force connection after initialization
      if (autoConnect) await connect()
    } catch (e) {
      const message = 'Error while initializing polkado.js api'
      console.error(message, e)
      setError({ code: UseInkathonErrorCode.InitializationError, message })
      setIsConnecting(false)
      setApi(undefined)
      setProvider(undefined)
    }
  }

  // Update signer when account changes
  const udpateSigner = async () => {
    if (!activeAccount?.meta?.source) {
      setActiveSigner(undefined)
      api?.setSigner(undefined as any)
      return
    }
    try {
      await api?.isReadyOrError
      // NOTE: Dynamic import  to prevent hydration error in SSR environments
      const { web3FromSource } = await import('@polkadot/extension-dapp')
      const injector = await web3FromSource(activeAccount.meta.source)
      setActiveSigner(injector?.signer)
      api?.setSigner(injector?.signer)
    } catch (e) {
      console.error('Error while getting signer:', e)
      setActiveSigner(undefined)
      api?.setSigner(undefined as any)
    }
  }
  useEffect(() => {
    udpateSigner()
  }, [activeAccount])

  // Updates account list and active account
  const updateAccounts = (injectedAccounts: InjectedAccountWithMeta[]) => {
    const newAccounts = injectedAccounts || []
    // Find active account in new accounts or fallback to first account
    const newAccount =
      newAccounts.find((a) => accountsAreEqual(a, activeAccount)) ||
      newAccounts?.[0]

    // Update accounts and active account
    setAccounts((accounts) => {
      if (accountArraysAreEqual(accounts, newAccounts)) return accounts
      return newAccounts
    })
    setActiveAccount((account) => {
      if (accountsAreEqual(account, newAccount)) return account
      setIsConnected(!!newAccount)
      return newAccount
    })
  }

  // Connect to injected wallets via polkadot-js/extension-dapp
  const connect = async () => {
    setError(undefined)
    setIsConnecting(true)
    setIsConnected(false)
    try {
      // NOTE: Dynamic import  to prevent hydration error in SSR environments
      const { web3AccountsSubscribe, web3Enable } = await import(
        '@polkadot/extension-dapp'
      )

      // Initialize web3 extension
      const extensions = await web3Enable(appName)
      if (!extensions?.length) {
        const message = 'No Substrate-compatible extension detected'
        setError({
          code: UseInkathonErrorCode.NoSubstrateExtensionDetected,
          message,
        })
        throw new Error(message)
      }

      // Query & keep listening to injected accounts
      unsubscribeAccounts?.()
      const unsubscribe = await web3AccountsSubscribe(updateAccounts)
      setUnsubscribeAccounts(unsubscribe)
    } catch (e: any) {
      console.error('Error while connecting wallet:', e)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect
  const disconnect = () => {
    setIsConnected(false)
    updateAccounts([])
    unsubscribeAccounts?.()
    setUnsubscribeAccounts(undefined)
  }

  // Initialze
  useEffect(() => {
    initialize(!!connectOnInit, defaultChain)
    return () => {
      unsubscribeAccounts?.()
    }
  }, [])

  // Switch active chain
  const switchActiveChain = async (chain: SubstrateChain) => {
    disconnect()
    await initialize(true, chain)
  }

  return (
    <UseInkathonProviderContext.Provider
      value={{
        isConnecting,
        isConnected,
        error,
        activeChain,
        switchActiveChain,
        api,
        provider,
        connect,
        disconnect,
        accounts,
        activeAccount,
        activeSigner,
        setActiveAccount,
        deployments,
      }}
    >
      {children}
    </UseInkathonProviderContext.Provider>
  )
}
