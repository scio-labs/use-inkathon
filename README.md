# `useInkathon` – React Hooks for Substrate & ink!

![Typescript](https://img.shields.io/badge/Typescript-blue)
![React](https://img.shields.io/badge/React-red)
[![Scio Labs](https://img.shields.io/badge/Scio%20Labs-We%20are%20hiring-black)](https://scio.xyz)

Typesafe React Hooks abstracting functionality by polkadot.js for working with Substrate-based networks and ink! Smart Contracts.

By [Dennis Zoma](https://zoma.dev) & [Scio Labs](https://scio.xyz)

➡️ **See it in action within the [ink!athon boilerplate](https://inkathon.xyz)!** ⬅️

## Disclaimer 🚨

This package is under development and not ready for production use yet. See the [open issues](https://github.com/scio-labs/use-inkathon/issues).

## Documentation 📃

https://scio-labs.github.io/use-inkathon/

## Features ✨

- Wrapper for polkadot.js (wallet connection, account switching, etc.) that **saves you 100+ lines of code**
- Easy-to-use React Hooks:
  - [`useInkathon`](https://scio-labs.github.io/use-inkathon/functions/useInkathon.html) – Main Hook responsible for connection, account management, etc.
  - [`useBalance`](https://scio-labs.github.io/use-inkathon/functions/useBalance.html) – Fetches the native token balance of a given wallet
  - [`useContract`](https://scio-labs.github.io/use-inkathon/functions/useContract.html) – Instantiates a polkadot.js `ContractPromise` for given abi & address
  - [`useRegisteredContract`](https://scio-labs.github.io/use-inkathon/functions/useRegisteredContract.html) – Instantiates a contract _with only one single identifier_ (read more about the contract registry concept below)
- Contract Interaction Helper Functions: Call mutating ([`contractTx`](https://scio-labs.github.io/use-inkathon/functions/contractTx.html)) and non-mutating ([`contractQuery`](https://scio-labs.github.io/use-inkathon/functions/contractQuery.html)) contract functions with automatic upfront gas estimation.
- Constants/Definitions for Substrate-based chains & wallets
- Makes polkadot.js compatible with server-side environments (i.e. Next.js)
- Works multichain with live & dynamic chain-switching out-of-the-box

## Getting Started

Install the package from the npm registry:

```bash
npm install @scio-labs/use-inkathon
```

Use it:

1. Wrap it around your app or parent component:

```tsx
// import { development, UseInkathonProvider } from '@scio-labs/use-inkathon'

<UseInkathonProvider appName="ink!athon" defaultChain={development}>
  <Component {...pageProps} />
</UseInkathonProvider>
```

2. Use the `useInkathon` hook everywhere underneath to access [all the exposed properties](https://scio-labs.github.io/use-inkathon/types/UseInkathonProviderContextType.html) below.

```ts
import { useInkathon } from '@scio-labs/use-inkathon'

const { api, connect, activeChain, activeAccount, … } = useInkathon()
```

## The Contract Registry Concept 🌟

Define metadata once and create `ContractPromise`s everywhere with just a single identifier:

```ts
const { contract } = useRegisteredContract('greeter')
```

This works by defining typesafe contract metadata objects ([example](https://github.com/scio-labs/inkathon/blob/main/packages/frontend/src/deployments/deployments.ts)) which are passed to the `UseInkathonProvider` provider ([example](https://github.com/scio-labs/inkathon/blob/main/packages/frontend/src/pages/_app.tsx)).

```ts
import { alephzeroTestnet, SubstrateDeployment } from '@scio-labs/use-inkathon'

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  return [
    {
      contractId: 'greeter',
      networkId: alephzeroTestnet.network,
      abi: await import(
        `@inkathon/contracts/greeter/deployments/metadata.json`
      ),
      address: '5HPwzKmJ6wgs18BEcLdH5P3mULnfnowvRzBtFcgQcwTLVwFc',
    },
  ]
}
```

```tsx
<UseInkathonProvider
  appName="ink!athon"
  defaultChain={alephzeroTestnet}
  deployments={getDeployments()}
>
  <Component {...pageProps} />
</UseInkathonProvider>
```

---

## Package Development

```bash
# Install pnpm (https://pnpm.io/)
npm i -g pnpm

# Install dependencies
pnpm i

# Start tsup in development mode (watching)
pnpm dev

# Build the package and generated docs
pnpm build
```

**Heads up**, when locally importing a development version of this package into other projects: Unfortunately, this does not yet work w/o generating a local packages `.tgz`-build every time. Otherwise, polkadot.js thinks it's installed twice with two different versions.

```bash
# 1. [THIS PACKAGE] Generate a .tgz package of the build
pnpm tsup && pnpm pack

# 2. [OTHER PROJECT] Add it as a dependency in your other project
#    NOTE: This results in a package.json entry like: `"@scio-labs/use-inkathon": "file:../scio-labs-use-inkathon-0.0.1-alpha.X.tgz"`
pnpm add ../use-inkathon/scio-labs-use-inkathon-0.0.1-alpha.X.tgz
# 3. [OTHER PROJECT] Subsequent updates can be done via
pnpm update @scio-labs/use-inkathon
```

## Package Release

```bash
GITHUB_TOKEN=… pnpm release-it
```
