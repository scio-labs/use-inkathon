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
import {
  allSubstrateWallets,
  enableWallet,
  getSubstrateWallet,
  isWalletInstalled,
  nightlyConnect,
} from '@/wallets'
import { ApiPromise, HttpProvider, WsProvider } from '@polkadot/api'
import { ApiOptions } from '@polkadot/api/types'
import { InjectedAccount, InjectedExtension, Unsubcall } from '@polkadot/extension-inject/types'
import { Signer } from '@polkadot/types/types'
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { getSubstrateChain } from './chains'
import { getNightlyConnectAdapter } from './helpers/getNightlyAdapter'

export const LS_ACTIVE_ACCOUNT_ADDRESS = 'activeAccountAddress'
export const LS_ACTIVE_EXTENSION_ID = 'activeExtensionId'

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
  supportedWallets?: SubstrateWallet[]
}
export const UseInkathonProvider: FC<UseInkathonProviderProps> = ({
  children,
  appName,
  defaultChain,
  connectOnInit,
  deployments: _deployments,
  apiOptions,
  supportedWallets = allSubstrateWallets,
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
  const isInitializing = useRef(false)
  const isInitialized = useRef(false)
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
  const [activeAccount, _setActiveAccount] = useState<InjectedAccount>()
  const [lastActiveAccount, setLastActiveAccount] = useState<InjectedAccount>()
  const activeExtension = useRef<InjectedExtension>()
  const activeSigner = useRef<Signer>()
  const unsubscribeAccounts = useRef<Unsubcall>()
  const [deployments, setDeployments] = useState<SubstrateDeployment[]>([])

  // Register given deployments
  useEffect(() => {
    if (_deployments) registerDeployments(setDeployments, _deployments)
  }, [])

  // Initialize polkadot-js/api
  const initialize = async (chain?: SubstrateChain): Promise<ApiPromise | undefined> => {
    isInitializing.current = true
    setIsConnected(false)
    setError(undefined)

    const _chain = chain || activeChain
    let _api: ApiPromise | undefined
    let _provider: WsProvider | HttpProvider | undefined
    try {
      ;({ api: _api, provider: _provider } = await initPolkadotJs(_chain, {
        noInitWarn: true,
        throwOnConnect: true,
        ...apiOptions,
      }))

      api?.disconnect()
      setApi(_api)
      provider?.disconnect()
      setProvider(_provider)
      isInitialized.current = true

      // Update active chain if switching
      if (activeChain.network !== _chain.network) setActiveChain(_chain)
    } catch (e) {
      const message = 'Error while initializing Polkadot.js API'
      console.error(message, e)
      setError({ code: UseInkathonErrorCode.InitializationError, message })
      setIsConnected(false)
      setIsConnecting(false)
      setApi(undefined)
      setProvider(undefined)
      isInitialized.current = false
    }

    isInitializing.current = false
    return _api
  }

  // Set active account with local storage persistence
  const setActiveAccount: React.Dispatch<React.SetStateAction<InjectedAccount | undefined>> = (
    account,
  ) => {
    if (typeof account === 'function') {
      _setActiveAccount((prevAccount) => {
        const newAccount = account(prevAccount)
        if (newAccount) {
          localStorage.setItem(LS_ACTIVE_ACCOUNT_ADDRESS, newAccount.address)
        } else {
          localStorage.removeItem(LS_ACTIVE_ACCOUNT_ADDRESS)
        }
        return newAccount
      })
    } else {
      _setActiveAccount(account)
      if (account) {
        localStorage.setItem(LS_ACTIVE_ACCOUNT_ADDRESS, account.address)
      } else {
        localStorage.removeItem(LS_ACTIVE_ACCOUNT_ADDRESS)
      }
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
    isInitialConnect?: boolean,
  ) => {
    setError(undefined)
    setIsConnecting(true)
    setIsConnected(!!activeAccount)

    // Make sure api is initialized & connected to provider
    if (!api?.isConnected || (chain && chain.network !== activeChain.network)) {
      const _api = await initialize(chain)
      if (!_api?.isConnected) return
    }

    try {
      // Determine installed wallets
      const wallets = supportedWallets.filter((w) => {
        if (!isWalletInstalled(w)) return false
        // Prevent NightlyConnect to pop up on init when no other wallet is available
        if (isInitialConnect && w.id === nightlyConnect.id) return false
        return true
      })
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
      activeExtension.current = extension
      localStorage.setItem(LS_ACTIVE_EXTENSION_ID, _wallet.id)
      activeSigner.current = extension?.signer as Signer

      // Query & keep listening to injected accounts
      unsubscribeAccounts.current?.()
      const unsubscribe = extension?.accounts.subscribe((accounts) => {
        updateAccounts(accounts, lastActiveAccountAddress)
      })
      unsubscribeAccounts.current = unsubscribe
    } catch (e: any) {
      console.error('Error while connecting wallet:', e)
      activeExtension.current = undefined
      activeSigner.current = undefined
      setIsConnected(false)
    } finally {
      setIsConnecting(false)
    }
  }

  // Keep active signer up to date
  useEffect(() => {
    api?.setSigner(activeSigner.current as Signer)
  }, [api, activeSigner.current])

  // Disconnect
  const disconnect = async (disconnectApi?: boolean) => {
    if (disconnectApi) {
      await provider?.disconnect()
      await api?.disconnect()
      localStorage.removeItem(LS_ACTIVE_EXTENSION_ID)
      localStorage.removeItem(LS_ACTIVE_ACCOUNT_ADDRESS)
      return
    }
    if (activeExtension.current?.name === nightlyConnect.id) {
      const adapter = await getNightlyConnectAdapter(appName)
      await adapter?.disconnect()
    }
    setIsConnected(false)
    updateAccounts([])
    unsubscribeAccounts.current?.()
    unsubscribeAccounts.current = undefined
    activeExtension.current = undefined
    activeSigner.current = undefined
    isInitialized.current = false
  }

  // API Disconnection listener
  useEffect(() => {
    if (!api) return
    const handler = () => {
      disconnect()
    }
    api?.on('disconnected', handler)
    return () => {
      api?.off('disconnected', handler)
    }
  }, [api])

  // Initialize
  useEffect(() => {
    if (isInitialized.current || isInitializing.current) return

    const activeExtensionId = localStorage.getItem(LS_ACTIVE_EXTENSION_ID) || undefined
    const activeAccountAddress = localStorage.getItem(LS_ACTIVE_ACCOUNT_ADDRESS) || undefined
    const userWantsConnection = activeExtensionId && activeAccountAddress

    let activeExtension: SubstrateWallet | undefined

    if (activeExtensionId) {
      activeExtension = allSubstrateWallets.find((w) => w.id === activeExtensionId)
    }

    connectOnInit || userWantsConnection
      ? connect(undefined, activeExtension, activeAccountAddress, true)
      : initialize()
    return () => {
      unsubscribeAccounts.current?.()
    }
  }, [])

  // Switch active chain
  const switchActiveChain = async (chain: SubstrateChain) => {
    const activeWallet = activeExtension.current && getSubstrateWallet(activeExtension.current.name)
    await connect(chain, activeWallet)
  }

  return (
    <UseInkathonProviderContext.Provider
      value={{
        isInitializing: isInitializing.current,
        isInitialized: isInitialized.current,
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
        activeExtension: activeExtension.current,
        activeSigner: activeSigner.current,
        setActiveAccount,
        lastActiveAccount,
        deployments,
        supportedWallets,
      }}
    >
      {children}
    </UseInkathonProviderContext.Provider>
  )
}
