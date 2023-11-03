export const getNightlyConnectSelectorLibrary: any = async () => {
  try {
    return new Promise((resolve) => {
      import('@nightlylabs/wallet-selector-polkadot').then((module) => resolve(module))
    })
  } catch {
    return undefined
  }
}

// In the case of the optional library, types are not available
let _adapter: any | undefined
export const getNightlyConnectAdapter = async (
  appName: string,
  appIcon?: string,
  appOrigin?: string,
  persisted = true,
) => {
  if (_adapter) return _adapter

  const nightlyConnectSelector = await getNightlyConnectSelectorLibrary()
  if (!nightlyConnectSelector) return undefined
  const NightlyConnectAdapter = nightlyConnectSelector.NightlyConnectAdapter
  _adapter = await NightlyConnectAdapter.buildLazy(
    {
      appMetadata: {
        name: appName,
        description: appOrigin,
        icon: appIcon,
      },
      network: 'AlephZero',
    },
    persisted,
  )
  return _adapter
}
