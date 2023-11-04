import { NightlyConnectAdapter } from '@nightlylabs/wallet-selector-polkadot'
import { getWebsiteIcon } from './getWebsiteIcon'

// In the case of the optional library, types are not available
let _adapter: any | undefined
export const getNightlyConnectAdapter = async (
  appName: string,
  appIcon?: string,
  appOrigin?: string,
  persisted = true,
) => {
  if (_adapter) return _adapter

  try {
    _adapter = await NightlyConnectAdapter.buildLazy(
      {
        appMetadata: {
          name: appName,
          icon: appIcon || (await getWebsiteIcon(window?.origin)),
          description: appOrigin || window?.origin,
        },
        network: 'AlephZero',
      },
      persisted,
    )
  } catch (e) {
    return undefined
  }

  return _adapter
}
