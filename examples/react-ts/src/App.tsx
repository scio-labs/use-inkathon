import { ConnectionSettings } from './components/ConnectionSettings'
import { ConnectionStatus } from './components/ConnectionStatus'

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
