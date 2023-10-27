import { useBalance, useInkathon } from '@scio-labs/use-inkathon'
import { useEffect, useState } from 'react'
import { TransferDialog } from './TransferDialog'

export function ConnectionStatus() {
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

          <div className="grid">
            {/* Transfer dialog */}
            <TransferDialog />

            {/* Disconnect button */}
            <button className="secondary" onClick={disconnect}>
              Disconnect
            </button>
          </div>
        </>
      )}
    </article>
  )
}
