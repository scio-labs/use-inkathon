import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

/**
 * Returns true if both given injected accounts have the same address.
 */
export const accountsAreEqual = (
  a1?: InjectedAccountWithMeta,
  a2?: InjectedAccountWithMeta,
) => {
  return (a1?.address || '').toLowerCase() === (a2?.address || '').toLowerCase()
}

/**
 * Returns true if both given arrays of injected accounts contain the
 * same objects with the same addresses in the same order.
 */
export const accountArraysAreEqual = (
  a1: InjectedAccountWithMeta[],
  a2: InjectedAccountWithMeta[],
) => {
  if (a1.length !== a2.length) return false
  return a1.every((a, i) => accountsAreEqual(a, a2[i]))
}
