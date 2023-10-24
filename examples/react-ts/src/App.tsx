import {
  allSubstrateChains,
  allSubstrateWallets,
  development,
  getSubstrateChain,
  getSubstrateWallet,
  useBalance,
  useInkathon,
} from '@scio-labs/use-inkathon'
import { useEffect, useState } from 'react'

export default function App() {
  return (
    <>
      <header className="container" style={{ paddingBottom: 0 }}>
        <hgroup>
          <h1>React Example</h1>
          <h2>
            This is a small vanilla React app showcasing <code>@scio-labs/use-inkathon</code>.
          </h2>
        </hgroup>
      </header>

      <div className="container">
        <div className="grid">
          {/* Connection Settings (pick network & wallet) */}
          <ConnectionSettings />

          {/* Connection status & Disconnect */}
          <ConnectionStatus />
        </div>
      </div>
    </>
  )
}

function ConnectionSettings() {
  const { connect } = useInkathon()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)
    const selectedNetwork = (document.getElementById('select-network') as HTMLSelectElement)?.value
    const selectedWallet = (document.getElementById('select-wallet') as HTMLSelectElement)?.value
    const substrateChain = getSubstrateChain(selectedNetwork)
    const substrateWallet = getSubstrateWallet(selectedWallet)
    console.log('Connection settings:', { substrateChain, substrateWallet })

    await connect?.(substrateChain, substrateWallet)
    setIsLoading(false)
  }

  return (
    <article>
      <h2 style={{ marginBottom: '1.5rem' }}>Connection Settings</h2>

      {/* Network list */}
      <label htmlFor="select-network">Network</label>
      <select id="select-network" required>
        {allSubstrateChains
          .filter((c) => c.network !== development.network)
          .map((chain) => (
            <option key={chain.network} value={chain.network}>
              {chain.name}
            </option>
          ))}
      </select>

      {/* Wallet list */}
      <label htmlFor="select-wallet">Wallet</label>
      <select id="select-wallet">
        <option>Default (detect)</option>
        {allSubstrateWallets.map((wallet) => (
          <option key={wallet.id} value={wallet.id}>
            {wallet.name}
          </option>
        ))}
      </select>

      {/* Connect button */}
      <button aria-busy={isLoading} disabled={isLoading} onClick={handleConnect}>
        Connect
      </button>
    </article>
  )
}

function ConnectionStatus() {
  const { api, isConnected, activeChain, activeAccount, disconnect } = useInkathon()

  // Fetch & watch balance
  const { balanceFormatted } = useBalance(activeAccount?.address, true)

  // Check whether the connected chain has pallet-contracts
  const [hasPalletContracts, setHasPalletContracts] = useState<boolean | undefined>(undefined)
  useEffect(() => {
    const getPalletVersion = api?.query?.contracts?.palletVersion
    setHasPalletContracts(!!getPalletVersion)
  }, [api])

  return (
    <article>
      <h2 style={{ marginBottom: '1.5rem' }}>Status</h2>

      <p>
        {isConnected ? (
          <code style={{ color: 'rgba(56, 142, 60, 1)', background: 'rgba(56, 142, 60, .1)' }}>
            Connected
          </code>
        ) : (
          <code>Disconnected</code>
        )}
      </p>

      {isConnected && (
        <>
          {/* Chain */}
          <strong>Network</strong>
          <small>
            <p>
              {activeChain?.name}{' '}
              {!hasPalletContracts && (
                <span style={{ color: 'rgba(198, 40, 40, 1)' }}>(pallet-contracts not found)</span>
              )}
            </p>
          </small>

          {/* Wallet Address */}
          <strong>Account</strong>
          <small>
            <p>{activeAccount?.address}</p>
          </small>

          {/* Balance */}
          <strong>Balance</strong>
          <small>
            <p>{balanceFormatted}</p>
          </small>

          {/* Disconnect button */}
          <button className="secondary" onClick={disconnect}>
            Disconnect
          </button>
        </>
      )}
    </article>
  )
}
