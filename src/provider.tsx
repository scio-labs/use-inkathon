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

export enum UseInkathonError {
  InitializationError,
  NoSubstrateExtensionDetected,
  NoAccountInjected,
}
export type UseInkathonProviderContextType = {
  isConnecting?: boolean
  isConnected?: boolean
  error?: UseInkathonError
  activeChain?: SubstrateChain
  setActiveChain?: Dispatch<SetStateAction<SubstrateChain>>
  api?: ApiPromise
  provider?: WsProvider | HttpProvider
  connect?: () => Promise<void>
  disconnect?: () => void
  accounts?: InjectedAccountWithMeta[]
  account?: InjectedAccountWithMeta
  signer?: Signer
  setAccount?: Dispatch<SetStateAction<InjectedAccountWithMeta | undefined>>
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
  const [account, setAccount] = useState<InjectedAccountWithMeta>()
  const [signer, setSigner] = useState<Signer>()
  const [unsubscribeAccounts, setUnsubscribeAccounts] = useState<Unsubcall>()
  const [deployments, setDeployments] = useState<SubstrateDeployment[]>([])

  // Register given deployments
  useEffect(() => {
    if (_deployments) registerDeployments(setDeployments, _deployments)
  }, [])

  // Initialize polkadot-js/api
  const initialize = async () => {
    setIsConnected(false)
    setError(undefined)

    try {
      const provider = new WsProvider(activeChain.rpcUrls[0])
      setProvider(provider)
      const api = await ApiPromise.create({ provider })
      setApi(api)

      // Optionally connect after initialization
      if (connectOnInit) await connect()
    } catch (e) {
      console.error('Error while initializing polkado-js/api:', e)
      setError(UseInkathonError.InitializationError)
      setIsConnecting(false)
      setApi(undefined)
      setProvider(undefined)
    }
  }

  // Update signer when account changes
  const udpateSigner = async () => {
    if (!account?.meta?.source) {
      setSigner(undefined)
      ;(api as any)?.setSigner(undefined)
      return
    }
    try {
      await api?.isReadyOrError
      // NOTE: Dynamic import  to prevent hydration error in SSR environments
      const { web3FromSource } = await import('@polkadot/extension-dapp')
      const injector = await web3FromSource(account.meta.source)
      setSigner(injector?.signer)
      api?.setSigner(injector?.signer)
    } catch (e) {
      console.error('Error while getting signer:', e)
      setSigner(undefined)
      ;(api as any)?.setSigner(undefined)
    }
  }
  useEffect(() => {
    udpateSigner()
  }, [account])

  // Updates account list and active account
  const updateAccounts = (injectedAccounts: InjectedAccountWithMeta[]) => {
    const newAccounts = injectedAccounts || []
    const newAccount = newAccounts?.[0]
    setAccounts((accounts) => {
      if (accountArraysAreEqual(accounts, newAccounts)) return accounts
      return newAccounts
    })
    setAccount((account) => {
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
        setError(UseInkathonError.NoSubstrateExtensionDetected)
        throw new Error('No Substrate-compatible extension detected')
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
    initialize()
    return () => {
      unsubscribeAccounts?.()
    }
  }, [activeChain?.network])

  return (
    <UseInkathonProviderContext.Provider
      value={{
        isConnecting,
        isConnected,
        error,
        activeChain,
        setActiveChain,
        api,
        provider,
        connect,
        disconnect,
        accounts,
        account,
        signer,
        setAccount,
        deployments,
      }}
    >
      {children}
    </UseInkathonProviderContext.Provider>
  )
}
