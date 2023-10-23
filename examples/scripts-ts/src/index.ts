import { BN } from '@polkadot/util'
import { getBalance, transferBalance } from '@scio-labs/use-inkathon'
import { initPolkadotJs } from './utils/initPolkadotJs'

const main = async () => {
  const chainId = process.env.CHAIN || 'alephzero-testnet'
  const accountUri = process.env.ACCOUNT_URI || '//Alice'
  const {
    api,
    decimals,
    symbol,
    keyring,
    account: alice,
  } = await initPolkadotJs(chainId, accountUri)

  // Initialize second account (//Bob)
  const bob = keyring.addFromUri('//Bob')

  // Print balances
  let balanceAlice = await getBalance(api, alice.address)
  let balanceBob = await getBalance(api, bob.address)
  console.log(`Balance of Alice: ${balanceAlice.balanceFormatted}`)
  console.log(`Balance of Bob:   ${balanceBob.balanceFormatted}`)

  // Transfer 1 unit from Alice to Bob
  try {
    await transferBalance(api, alice, bob.address, new BN(1).mul(new BN(10).pow(new BN(decimals))))
    console.log(`\nTransferred 1 ${symbol} from Alice to Bob\n`)
  } catch (e) {
    console.error("Couldn't transfer balance:", e)
    console.log(`
      Per default, this scripts connects to a live testnet node.
      Alice, with widely known private key, could simply not have enough funds.
      You can fund her at https://faucet.alephzero.org/.
    `)
  }

  // Print balances again
  balanceAlice = await getBalance(api, alice.address)
  balanceBob = await getBalance(api, bob.address)
  console.log(`Balance of Alice: ${balanceAlice.balanceFormatted}`)
  console.log(`Balance of Bob:   ${balanceBob.balanceFormatted}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => process.exit(0))
