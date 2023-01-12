import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

/**
 * Returns true if both given injected accounts have the same address.
 */
export const accountsAreEqual = (
  acc1: InjectedAccountWithMeta,
  acc2: InjectedAccountWithMeta,
) => {
  return (
    (acc1?.address || '').toLowerCase() === (acc2?.address || '').toLowerCase()
  )
}
