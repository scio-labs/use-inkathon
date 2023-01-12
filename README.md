# `useInkathon` – React Hooks for Substrate & ink!

![Typescript](https://img.shields.io/badge/Typescript-blue)
![React](https://img.shields.io/badge/React-red)
[![Scio Labs](https://img.shields.io/badge/Scio%20Labs-We%20are%20hiring-black)](https://scio.xyz)

Typesafe React Hooks abstracting functionality by polkadot.js for working with Substrate-based networks and ink! Smart Contracts.

It can be seen in action in the [inkathon.xyz boilerplate](https://inkathon.xyz) and on [AZERO Domains](https://azero.domains).

By [Dennis Zoma](https://zoma.dev) 💫 & [Scio Labs](https://scio.xyz) 🪐

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

```ts
import { development, UseInkathonProvider } from '@scio-labs/use-inkathon'
```

```tsx
<UseInkathonProvider appName="INK!athon" defaultChain={development}>
  <Component {...pageProps} />
</UseInkathonProvider>
```

2. Use the `useInkathon` hook everywhere underneath to access [all the exposed properties](https://scio-labs.github.io/use-inkathon/types/UseInkathonProviderContextType.html) below.

```ts
const { api, activeChain, connect, account, … } = useInkathon()
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
  appName="INK!athon"
  defaultChain={env.defaultChain}
  deployments={getDeployments()}
>
  <Component {...pageProps} />
</UseInkathonProvider>
```

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

When locally importing it into other projects, this does not yet work with `pnpm link`, unfortunately. A local build package has to be generated and imported like:

```bash
# 1. Generate a .tgz package of the build (w/o node_modules)
pnpm pack

# 2. Add it as a dependency in your other project
pnpm add ../use-inkathon/scio-labs-use-inkathon-0.0.1-alpha.0.tgz
# This results in a package.json entry like: `"@scio-labs/use-inkathon": "file:..//scio-labs-use-inkathon-0.0.1-alpha.0.tgz"`
```

## Package Release

```bash
GITHUB_TOKEN=… pnpm release-it
```
