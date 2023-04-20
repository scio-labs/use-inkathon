import { accountArraysAreEqual, accountsAreEqual } from '@helpers'
import { initPolkadotJs } from '@helpers/initPolkadotJs'
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api'
import { ApiOptions } from '@polkadot/api/types'
import {
  InjectedAccount,
  InjectedExtension,
  Unsubcall,
} from '@polkadot/extension-inject/types'
import { Signer } from '@polkadot/types/types'
import { SubstrateDeployment, registerDeployments } from '@registry'
import {
  SubstrateWallet,
  allSubstrateWallets,
  enableWallet,
  getSubstrateWallet,
  isWalletInstalled,
} from '@wallets'
import {
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { SubstrateChain, getSubstrateChain } from './chains'

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
  connect?: (chain?: SubstrateChain, wallet?: SubstrateWallet) => Promise<void>
  disconnect?: () => void
  accounts?: InjectedAccount[]
  activeAccount?: InjectedAccount
  activeExtension?: InjectedExtension
  activeSigner?: Signer
  setActiveAccount?: Dispatch<SetStateAction<InjectedAccount | undefined>>
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
  const [accounts, setAccounts] = useState<InjectedAccount[]>([])
  const [activeAccount, setActiveAccount] = useState<InjectedAccount>()
  const [activeExtension, setActiveExtension] = useState<InjectedExtension>()
  const [latestActiveAccount, setLatestActiveAccount] =
    useState<InjectedAccount>()
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

  // Updates account list and active account
  const updateAccounts = (injectedAccounts: InjectedAccount[]) => {
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

  // Connect to injected wallet
  const connect = async (chain?: SubstrateChain, wallet?: SubstrateWallet) => {
    setError(undefined)
    setIsConnecting(true)
    setIsConnected(false)

    // Make sure api is initialized & connected to provider
    if (!api?.isConnected || (chain && chain.network !== activeChain.network)) {
      await initialize(chain)
    }

    try {
      // Determine installed wallets
      const wallets = allSubstrateWallets.filter((w) => isWalletInstalled(w))
      if (!wallets?.length) {
        const message = 'No Substrate-compatible extension detected'
        setError({
          code: UseInkathonErrorCode.NoSubstrateExtensionDetected,
          message,
        })
        throw new Error(message)
      }

      // Determine wallet to use
      const preferredWallet = wallet && wallets.find((w) => w.id === wallet.id)
      const _wallet = preferredWallet || wallets[0]

      // Enable wallet
      const extension = await enableWallet(_wallet, appName)
      const signer = extension?.signer as Signer
      setActiveExtension(extension)
      setActiveSigner(signer)

      // Query & keep listening to injected accounts
      unsubscribeAccounts?.()
      const unsubscribe = extension?.accounts.subscribe(updateAccounts)
      setUnsubscribeAccounts(unsubscribe)
    } catch (e: any) {
      console.error('Error while connecting wallet:', e)
      setActiveExtension(undefined)
      setActiveSigner(undefined)
    } finally {
      setIsConnecting(false)
    }
  }

  // Keep active signer up to date
  useEffect(() => {
    api?.setSigner(activeSigner as Signer)
  }, [api, activeSigner])

  // Disconnect
  const disconnect = async () => {
    await api?.disconnect()
    setIsConnected(false)
    setIsConnecting(false)
    updateAccounts([])
    unsubscribeAccounts?.()
    setUnsubscribeAccounts(undefined)
    setActiveExtension(undefined)
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
    const activeWallet =
      activeExtension && getSubstrateWallet(activeExtension.name)
    await connect(chain, activeWallet)
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
        activeExtension,
        activeSigner,
        setActiveAccount,
        deployments,
      }}
    >
      {children}
    </UseInkathonProviderContext.Provider>
  )
}
