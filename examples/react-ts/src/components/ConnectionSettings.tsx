import {
  allSubstrateChains,
  allSubstrateWallets,
  getSubstrateChain,
  getSubstrateWallet,
  useInkathon,
} from '@poppyseed/lastic-sdk'
import { useState } from 'react'

export function ConnectionSettings() {
  const { connect } = useInkathon()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)
    const selectedNetwork = (document.getElementById('select-coretime-chain') as HTMLSelectElement)
      ?.value
    const selectedRelayNetwork = (
      document.getElementById('select-relay-chain') as HTMLSelectElement
    )?.value
    const selectedWallet = (document.getElementById('select-wallet') as HTMLSelectElement)?.value
    const substrateChain = getSubstrateChain(selectedNetwork)
    const substrateRelayChain = getSubstrateChain(selectedRelayNetwork)
    const substrateWallet = getSubstrateWallet(selectedWallet)
    console.log('Connection settings:', { substrateChain, substrateRelayChain, substrateWallet })

    await connect?.(substrateChain, substrateRelayChain, substrateWallet)
    setIsLoading(false)
  }

  return (
    <article>
      <h2 style={{ marginBottom: '1.5rem' }}>Connection Settings</h2>

      <form>
        {/* Network list */}
        <label htmlFor="select-coretime-chain">Coretime Chain</label>
        <select id="select-coretime-chain" required>
          {allSubstrateChains.map((chain) => (
            <option key={chain.network} value={chain.network}>
              {chain.name}
            </option>
          ))}
        </select>

        <label htmlFor="select-relay-chain">Relay Chain</label>
        <select id="select-relay-chain" required>
          {allSubstrateChains.map((relayChain) => (
            <option key={relayChain.network} value={relayChain.network}>
              {relayChain.name}
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
