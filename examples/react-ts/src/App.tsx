import { useEffect, useState } from 'react'
import { allSubstrateChains, development, getSubstrateChain, useInkathon } from '../../../dist'

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
          {/* Connect to a network */}
          <ConnectToNetwork />
          {/* Connection status & Disconnect */}
          <ConnectionStatus />
        </div>
      </div>
    </>
  )
}

function ConnectToNetwork() {
  const { connect } = useInkathon()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async () => {
    setIsLoading(true)
    const selectedChain = document.querySelector<HTMLInputElement>(
      'input[name="radio-chain"]:checked',
    )?.value
    const substrateChain = getSubstrateChain(selectedChain)
    await connect?.(substrateChain)
    setIsLoading(false)
  }

  return (
    <article>
      <h2>Connect to a network</h2>

      {/* Network list */}
      <fieldset>
        {allSubstrateChains
          .filter((c) => c.network !== development.network)
          .map((chain, index) => (
            <label htmlFor={`radio-chain-${chain.network}`} key={chain.network}>
              <input
                type="radio"
                name="radio-chain"
                id={`radio-chain-${chain.network}`}
                value={chain.network}
                defaultChecked={index === 0}
              />
              {chain.name}
            </label>
          ))}
      </fieldset>

      {/* Connect button */}
      <button aria-busy={isLoading} disabled={isLoading} onClick={handleConnect}>
        Connect
      </button>
    </article>
  )
}

function ConnectionStatus() {
  const { api, isConnected, activeChain, activeAccount, disconnect } = useInkathon()
  const [palletVersion, setPalletVersion] = useState<number | undefined | null>(undefined)

  useEffect(() => {
    const getPalletVersion = api?.query?.contracts?.palletVersion
    if (!getPalletVersion) {
      setPalletVersion(null)
    } else {
      getPalletVersion().then((v) => {
        setPalletVersion((v as any)?.words?.[0])
      })
    }
  }, [api])

  return (
    <article>
      <h2>Status</h2>

      {!isConnected && <em>Not connected</em>}

      {isConnected && (
        <>
          {/* Network status */}
          <p>
            <em>Successfully connected</em>
          </p>
          <ul>
            <li>
              <strong>Network:</strong> {activeChain?.name}
            </li>
            <li>
              <strong>Contracts Pallet Version:</strong>{' '}
              {palletVersion === null ? 'Not available' : palletVersion}
            </li>
            <li>
              <strong>Account:</strong> {activeAccount?.address}
            </li>
          </ul>

          {/* Disconnect button */}
          <button className="secondary" onClick={disconnect}>
            Disconnect
          </button>
        </>
      )}
    </article>
  )
}
