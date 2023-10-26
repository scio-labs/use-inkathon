import { BN } from '@polkadot/util'
import { checkAddress } from '@polkadot/util-crypto'
import { formatBalance, transferBalance, useBalance, useInkathon } from '@scio-labs/use-inkathon'
import { useState } from 'react'

export function TransferDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Dialog Trigger */}
      <button className="secondary" onClick={() => setIsOpen(true)}>
        Transfer Funds
      </button>

      {/* Transfer Dialog */}
      <dialog open={isOpen}>
        <article>
          <a
            href="#close"
            aria-label="Close"
            className="close"
            data-target="modal-example"
            onClick={() => setIsOpen(false)}
          ></a>
          <h3>Transfer Funds</h3>

          <TransferDialogForm onCloseDialog={() => setIsOpen(false)} />
        </article>
      </dialog>
    </>
  )
}

interface TransferDialogFormProps {
  onCloseDialog: () => void
}
function TransferDialogForm({ onCloseDialog }: TransferDialogFormProps) {
  const { api, activeAccount } = useInkathon()
  const { tokenSymbol, tokenDecimals, reducibleBalance } = useBalance(activeAccount?.address, true)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    if (!api || !activeAccount || !reducibleBalance) return
    setIsLoading(true)

    try {
      // Determine transfer parameters
      const transferAddress = (document.getElementById('transfer-address') as HTMLInputElement)
        ?.value
      const prefix = api?.registry.chainSS58 || 42
      if (!transferAddress && !checkAddress(transferAddress, prefix)[0]) {
        throw new Error('Invalid address. Aborting.')
      }

      const transferAmount = parseFloat(
        (document.getElementById('transfer-amount') as HTMLInputElement)?.value,
      )
      if (!transferAmount || transferAmount <= 0) {
        throw new Error('Invalid amount. Aborting.')
      }

      // Convert value to BN with chain's decimals
      const precision = 5
      const amount = new BN(transferAmount * 10 ** precision).mul(
        new BN(10).pow(new BN(tokenDecimals - precision)),
      )
      const amountFormatted = formatBalance(api, amount)

      // Perform transfer
      await transferBalance(api, activeAccount.address, transferAddress, amount)
      console.log(`Successfully transferred ${amountFormatted} to ${transferAddress}.`)
      onCloseDialog()
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Transfer form */}
      <form>
        <label htmlFor="transfer-address">
          Destination Address (SS58)
          <input
            type="text"
            id="transfer-address"
            name="transfer-address"
            placeholder="5FE51…xe1XL"
            required
          />
        </label>

        <label htmlFor="transfer-amount">
          Amount ({tokenSymbol})
          <input
            type="number"
            id="transfer-amount"
            name="transfer-amount"
            placeholder="10.0"
            min={0}
            required
          />
        </label>
      </form>
      {/* Footer */}
      <div className="grid" style={{ marginTop: '1rem', marginBottom: '-2rem' }}>
        <button className="secondary" onClick={onCloseDialog} disabled={isLoading}>
          Cancel
        </button>
        <button onClick={handleConfirm} aria-busy={isLoading} disabled={isLoading}>
          Confirm
        </button>
      </div>
    </>
  )
}
