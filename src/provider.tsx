import { accountArraysAreEqual, accountsAreEqual, initPolkadotJs } from '@/helpers'
import { registerDeployments } from '@/registry'
import {
  SubstrateChain,
  SubstrateDeployment,
  SubstrateWallet,
  UseInkathonError,
  UseInkathonErrorCode,
  UseInkathonProviderContextType,
} from '@/types'
import { allSubstrateWallets, enableWallet, getSubstrateWallet, isWalletInstalled } from '@/wallets'
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api'
import { ApiOptions } from '@polkadot/api/types'
import { InjectedAccount, InjectedExtension, Unsubcall } from '@polkadot/extension-inject/types'
import { Signer } from '@polkadot/types/types'
import { FC, PropsWithChildren, createContext, useContext, useEffect, useState } from 'react'
import { getSubstrateChain } from './chains'
import { getNightlyConnectAdapter } from './helpers/getNightlyAdapter'

const UseInkathonProviderContext = createContext<UseInkathonProviderContextType | null>(null)

/**
 * Primary useInkathon hook that exposes `UseInkathonProviderContext`.
 */
export const useInkathon = () => {
  const context = useContext(UseInkathonProviderContext)
  if (!context) throw new Error('useInkathon must be used within a UseInkathonProvider')
  return context
}

/**
 * Main provider that needs to be wrapped around the app (see README)
 * to use `useInkathon` and other hooks anywhere.
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
    (typeof defaultChain === 'string' && getSubstrateChain(defaultChain) === undefined)
  ) {
    throw new Error(
      'None or invalid `defaultChain` provided with `UseInkathonProvider`. Forgot to set environment variable?',
    )
  }

  // Setup state variables
  const [isInitializing, setIsInitializing] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
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
  const [lastActiveAccount, setLastActiveAccount] = useState<InjectedAccount>()
  const [activeSigner, setActiveSigner] = useState<Signer>()
  const [unsubscribeAccounts, setUnsubscribeAccounts] = useState<Unsubcall>()
  const [deployments, setDeployments] = useState<SubstrateDeployment[]>([])

  // Register given deployments
  useEffect(() => {
    if (_deployments) registerDeployments(setDeployments, _deployments)
  }, [])

  // Initialize polkadot-js/api
  const initialize = async (chain?: SubstrateChain) => {
    setIsInitialized(!!api?.isConnected)
    setIsInitializing(true)
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
      setIsInitialized(true)

      // Update active chain if switching
      if (activeChain.network !== _chain.network) setActiveChain(_chain)
    } catch (e) {
      const message = 'Error while initializing polkadot.js api'
      console.error(message, e)
      setError({ code: UseInkathonErrorCode.InitializationError, message })
      setIsConnected(false)
      setIsConnecting(false)
      setIsInitialized(false)
      setApi(undefined)
      setProvider(undefined)
    } finally {
      setIsInitializing(false)
    }
  }

  // Updates account list and active account
  const updateAccounts = (
    injectedAccounts: InjectedAccount[],
    lastActiveAccountAddress?: string,
  ) => {
    const newAccounts = injectedAccounts || []
    // Find active account in new accounts or fallback to latest account
    const _lastAccount = lastActiveAccountAddress
      ? { address: lastActiveAccountAddress }
      : lastActiveAccount
    const newAccount =
      newAccounts.find((a) => accountsAreEqual(a, _lastAccount)) || newAccounts?.[0]

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
    if (activeAccount && !accountsAreEqual(activeAccount, lastActiveAccount)) {
      setLastActiveAccount(() => activeAccount)
    }
  }, [activeAccount])

  // Connect to injected wallet
  const connect = async (
    chain?: SubstrateChain,
    wallet?: SubstrateWallet,
    lastActiveAccountAddress?: string,
  ) => {
    setError(undefined)
    setIsConnecting(true)
    setIsConnected(!!activeAccount)

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
      const unsubscribe = extension?.accounts.subscribe((accounts) => {
        updateAccounts(accounts, lastActiveAccountAddress)
      })
      setUnsubscribeAccounts(unsubscribe)
    } catch (e: any) {
      console.error('Error while connecting wallet:', e)
      setActiveExtension(undefined)
      setActiveSigner(undefined)
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }

  // Keep active signer up to date
  useEffect(() => {
    api?.setSigner(activeSigner as Signer)
  }, [api, activeSigner])

  // Disconnect
  const disconnect = async (disconnectApi?: boolean) => {
    if (disconnectApi) {
      await api?.disconnect()
      return
    }
    //activeExtension is undefined
    // if (activeExtension?.name === nightlyConnect.name) {
    const adapter = await getNightlyConnectAdapter(appName)
    await adapter?.disconnect()
    // }
    setIsConnected(false)
    updateAccounts([])
    unsubscribeAccounts?.()
    setUnsubscribeAccounts(undefined)
    setActiveExtension(undefined)
  }

  // API Disconnection listener
  useEffect(() => {
    const handler = () => {
      disconnect()
      setIsInitialized(false)
    }
    api?.on('disconnected', handler)
    return () => {
      api?.off('disconnected', handler)
    }
  }, [api])

  // Initialze
  useEffect(() => {
    connectOnInit ? connect() : initialize()
    return () => {
      unsubscribeAccounts?.()
    }
  }, [])

  // Switch active chain
  const switchActiveChain = async (chain: SubstrateChain) => {
    const activeWallet = activeExtension && getSubstrateWallet(activeExtension.name)
    await connect(chain, activeWallet)
  }

  return (
    <UseInkathonProviderContext.Provider
      value={{
        isInitializing,
        isInitialized,
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
        lastActiveAccount,
        deployments,
      }}
    >
      {children}
    </UseInkathonProviderContext.Provider>
  )
}
