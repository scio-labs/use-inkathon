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

export type UseInkathonProviderContextType = {
  activeChain?: SubstrateChain
  setActiveChain?: Dispatch<SetStateAction<SubstrateChain>>
  api?: ApiPromise
  provider?: WsProvider | HttpProvider
  connect?: () => Promise<void>
  disconnect?: () => void
  isLoading?: boolean
  accounts?: InjectedAccountWithMeta[]
  account?: InjectedAccountWithMeta
  isConnected?: boolean
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
  const [activeChain, setActiveChain] = useState<SubstrateChain>(defaultChain)
  const [api, setApi] = useState<ApiPromise>()
  const [provider, setProvider] = useState<WsProvider | HttpProvider>()
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([])
  const [account, setAccount] = useState<InjectedAccountWithMeta>()
  const [signer, setSigner] = useState<Signer>()
  const [isLoading, setIsLoading] = useState<boolean>()
  const [unsubscribeAccounts, setUnsubscribeAccounts] = useState<Unsubcall>()
  const [deployments, setDeployments] = useState<SubstrateDeployment[]>([])

  // Register given deployments
  useEffect(() => {
    if (_deployments) registerDeployments(setDeployments, _deployments)
  }, [])

  const initialize = async () => {
    // Initialize polkadot-js/api
    try {
      const provider = new WsProvider(activeChain.rpcUrls[0])
      setProvider(provider)
      const api = await ApiPromise.create({ provider })
      setApi(api)
    } catch (e) {
      console.error('Error while initializing polkadot-js/api:', e)
      setApi(undefined)
      setProvider(undefined)
    }

    // Optionally Connect
    if (connectOnInit) await connect()
  }

  const connect = async () => {
    setIsLoading(true)
    try {
      // Dynamically import polkadot/extension-dapp (hydration error otherwise)
      const { web3AccountsSubscribe, web3Enable } = await import(
        '@polkadot/extension-dapp'
      )

      // Initialize web3 extension
      const extensions = await web3Enable(appName)
      if (!extensions?.length) {
        throw new Error('No Substrate-compatible extension detected.')
      }

      // Query & keep listening to web3 accounts
      unsubscribeAccounts?.()
      const unsubscribe = await web3AccountsSubscribe((injectedAccounts) => {
        setAccounts(injectedAccounts || [])
        setAccount(injectedAccounts?.length ? injectedAccounts[0] : undefined)
      })
      setUnsubscribeAccounts(unsubscribe)
    } catch (e) {
      console.error(e)
      throw new Error(
        'Error while fetching accounts with polkadot/extension-dapp.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAccounts([])
    setAccount(undefined)
    unsubscribeAccounts?.()
    setUnsubscribeAccounts(undefined)
  }

  // Initialze
  useEffect(() => {
    initialize()
    return unsubscribeAccounts
  }, [activeChain?.network])

  // Update signer
  const udpateSigner = async () => {
    if (!account) {
      setSigner(undefined)
      ;(api as any)?.setSigner(undefined)
      return
    }
    try {
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

  return (
    <UseInkathonProviderContext.Provider
      value={{
        activeChain,
        setActiveChain,
        api,
        provider,
        connect,
        disconnect,
        isLoading,
        accounts,
        account,
        isConnected: !!account,
        signer,
        setAccount,
        deployments,
      }}
    >
      {children}
    </UseInkathonProviderContext.Provider>
  )
}
