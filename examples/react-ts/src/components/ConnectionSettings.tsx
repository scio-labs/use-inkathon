import {
  allSubstrateChains,
  allSubstrateWallets,
  getSubstrateChain,
  getSubstrateWallet,
  useInkathon,
} from '@scio-labs/use-inkathon'
import { useState } from 'react'

export function ConnectionSettings() {
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

      <form>
        {/* Network list */}
        <label htmlFor="select-network">Network</label>
        <select id="select-network" required>
          {allSubstrateChains.map((chain) => (
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
      </form>

      {/* Connect button */}
      <button aria-busy={isLoading} disabled={isLoading} onClick={handleConnect}>
        Connect
      </button>
    </article>
  )
}
