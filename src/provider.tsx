import { accountArraysAreEqual, accountsAreEqual } from '@helpers'
import { initPolkadotJs } from '@helpers/initPolkadotJs'
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api'
import { ApiOptions } from '@polkadot/api/types'
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
import { getSubstrateChain, SubstrateChain } from './chains'

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
  createContext<UseInkathonProviderContextType | null>(null)

/**
 * Primary useInkathon hook that exposes `UseInkathonProviderContext`.
 */
export const useInkathon = () => {
  const context = useContext(UseInkathonProviderContext)

  if (!context)
    throw new Error('useInkathon must be used within a UseInkathonProvider')

  return context
}

/**
 * Primary useInkathon provider that needs to be wrapped around the app
 * (see documentation) to use `useInkathon` and other hooks anywhere.
 */
export interface UseInkathonProviderProps extends PropsWithChildren {
  appName: string
  defaultChain: SubstrateChain | SubstrateChain['network']
  connectOnInit?: boolean
  deployments?: Promise<SubstrateDeployment[]>
  apiOptions?: ApiOptions
}
export const UseInkathonProvider: FC<UseInkathonProviderProps> = ({
  children,
  appName,
  defaultChain,
  connectOnInit,
  deployments: _deployments,
  apiOptions,
}) => {
  // Check if default chain was provided
  if (
    !defaultChain ||
    (typeof defaultChain === 'string' &&
      getSubstrateChain(defaultChain) === undefined)
  ) {
    throw new Error(
      'None or invalid `defaultChain` provided with `UseInkathonProvider`. Forgot to set environment variable?',
    )
  }

  // Setup state variables
  const [isConnecting, setIsConnecting] = useState(connectOnInit)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<UseInkathonError | undefined>()
  const [activeChain, setActiveChain] = useState<SubstrateChain>(
    (typeof defaultChain === 'string'
      ? getSubstrateChain(defaultChain)
      : defaultChain) as SubstrateChain,
  )
  const [api, setApi] = useState<ApiPromise>()
  const [provider, setProvider] = useState<WsProvider | HttpProvider>()
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [activeAccount, setActiveAccount] = useState<InjectedAccountWithMeta>()
  const [latestActiveAccount, setLatestActiveAccount] =
    useState<InjectedAccountWithMeta>()
  const [activeSigner, setActiveSigner] = useState<Signer>()
  const [unsubscribeAccounts, setUnsubscribeAccounts] = useState<Unsubcall>()
  const [deployments, setDeployments] = useState<SubstrateDeployment[]>([])

  // Register given deployments
  useEffect(() => {
    if (_deployments) registerDeployments(setDeployments, _deployments)
  }, [])

  // Initialize polkadot-js/api
  const initialize = async (chain?: SubstrateChain) => {
    setIsConnected(false)
    setError(undefined)

    try {
      const _chain = chain || activeChain
      const { api, provider } = await initPolkadotJs(_chain, {
        noInitWarn: true,
        throwOnConnect: true,
        ...apiOptions,
      })
      setProvider(provider)
      setApi(api)

      // Update active chain if switching
      if (activeChain.network !== _chain.network) setActiveChain(_chain)
    } catch (e) {
      const message = 'Error while initializing polkadot.js api'
      console.error(message, e)
      setError({ code: UseInkathonErrorCode.InitializationError, message })
      setIsConnecting(false)
      setApi(undefined)
      setProvider(undefined)
    }
  }

  // Update signer when account changes
  const udpateSigner = async () => {
    await api?.isReadyOrError
    if (!activeAccount?.meta?.source || !api) {
      setActiveSigner(undefined)
      api?.setSigner(undefined as any)
      return
    }

    try {
      // NOTE: Dynamic import  to prevent hydration error in SSR environments
      const { web3FromSource } = await import('@polkadot/extension-dapp')
      const injector = await web3FromSource(activeAccount.meta.source)
      const signer = injector?.signer
      setActiveSigner(signer)
      api.setSigner(signer)
    } catch (e) {
      console.error('Error while setting signer:', e)
      setActiveSigner(undefined)
      api.setSigner(undefined as any)
    }
  }
  useEffect(() => {
    udpateSigner()
  }, [api, activeAccount])

  // Updates account list and active account
  const updateAccounts = (injectedAccounts: InjectedAccountWithMeta[]) => {
    const newAccounts = injectedAccounts || []
    // Find active account in new accounts or fallback to first account
    const newAccount =
      newAccounts.find((a) => accountsAreEqual(a, latestActiveAccount)) ||
      newAccounts?.[0]

    // Update accounts and active account
    if (!accountArraysAreEqual(accounts, newAccounts)) {
      setAccounts(() => newAccounts)
    }
    if (!accountsAreEqual(activeAccount, newAccount)) {
      setActiveAccount(() => newAccount)
    }
    setIsConnected(!!newAccount)
  }
  useEffect(() => {
    if (
      activeAccount &&
      !accountsAreEqual(activeAccount, latestActiveAccount)
    ) {
      setLatestActiveAccount(() => activeAccount)
    }
  }, [activeAccount])

  // Connect to injected wallets via polkadot-js/extension-dapp
  const connect = async (chain?: SubstrateChain) => {
    setError(undefined)
    setIsConnecting(true)
    setIsConnected(false)

    // Make sure api is initialized & connected to provider
    if (!api?.isConnected || (chain && chain.network !== activeChain.network)) {
      await initialize(chain)
    }

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
    api?.disconnect()
    setIsConnected(false)
    setIsConnecting(false)
    updateAccounts([])
    unsubscribeAccounts?.()
    setUnsubscribeAccounts(undefined)
  }

  // Initialze
  useEffect(() => {
    connectOnInit ? connect() : initialize()
    return () => {
      unsubscribeAccounts?.()
    }
  }, [])

  // Switch active chain
  const switchActiveChain = async (chain: SubstrateChain) => {
    disconnect()
    await connect(chain)
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
