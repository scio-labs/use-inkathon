import { NightlyConnectAdapter } from '@nightlylabs/wallet-selector-polkadot'

let _adapter: NightlyConnectAdapter | undefined
export const getNightlyConnectAdapter = async (persisted = true) => {
  if (_adapter) return _adapter
  _adapter = await NightlyConnectAdapter.build(
    {
      appMetadata: {
        name: 'Use-inkathon selector',
        description: 'Use-inkathon selector',
        icon: 'https://inkathon.xyz/favicons/apple-touch-icon.png',
      },
      network: 'AlephZero',
    },
    persisted,
  )
  return _adapter
}
