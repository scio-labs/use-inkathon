![inkathon Devtooling Banner](inkathon-devtooling-banner.png)

# `useInkathon` – React Hooks & Utility Library

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Built with ink!](https://raw.githubusercontent.com/paritytech/ink/master/.images/badge.svg)](https://use.ink)
![TypeScript](https://img.shields.io/badge/TypeScript-000000?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-000000?logo=react&logoColor=white)

This library provides typesafe React hooks and utility functions that simplify the process of working with Substrate-based networks and ink! smart contracts. It abstracts away the complexities of polkadot{.js} but still lets you access the full power of the underlying API.

The project is part of a [Scio Labs](https://scio.xyz) initiative to improve the developer experience in the ink! ecosystem and a proud member of the [Aleph Zero EFP](https://alephzero.org/ecosystem-funding-program). 💜

Other projects include:

- `create-ink-app` CLI (_Coming soon_)
- [`ink!athon`](https://github.com/scio-labs/inkathon) Boilerplate
- [`useInkathon`](https://github.com/scio-labs/use-inkathon) Hooks & Utility Library
- [`zink!`](https://github.com/scio-labs/zink) Smart Contract Macros

**Join the discussion in our [Telegram Group](https://t.me/inkathon)** 💬

**Checkout our [TypeDoc Documentation](https://scio-labs.github.io/use-inkathon/)** 📃

---

1. [Getting started 🚀](#getting-started-)
2. [Features ✨](#features-)
3. [Contract Registry 🗳️](#contract-registry-️)
   1. [How it works](#how-it-works)
4. [Package Development 🛠](#package-development-)

---

## Getting started 🚀

> [!IMPORTANT]  
> If you are looking for a boilerplate to start your dApp project from scratch, checkout the [ink!athon dApp boilerplate](https://inkathon.xyz) instead.

1. Go to your existing project and install the package from the npm registry:

```bash
pnpm add @scio-labs/use-inkathon
# or
npm install @scio-labs/use-inkathon
# or
yarn add @scio-labs/use-inkathon
```

2. Wrap it around your app or parent component:

```ts
import { development, UseInkathonProvider } from '@scio-labs/use-inkathon'
```

```tsx
<UseInkathonProvider appName="My dApp" defaultChain={development}>
  <Component {...pageProps} />
</UseInkathonProvider>
```

1. Use the primary `useInkathon` hook for connecting the wallet or accessing the API:

```ts
import { useInkathon } from '@scio-labs/use-inkathon'
```

```ts
const { api, connect, activeChain, activeAccount, … } = useInkathon()
```

## Features ✨

At its core, this library serves as a **wrapper for polkadot{.js}, potentially saving you over 100 lines of code.** This includes:

- Utility functions for API initialization, connection, account management, balance checks, transfers, contract interactions, etc.
- React hooks & provider for easy access to all of the above, including:
  - [`useInkathon`](https://scio-labs.github.io/use-inkathon/functions/useInkathon.html) – Main Hook responsible for connection, account management, etc.
  - [`useBalance`](https://scio-labs.github.io/use-inkathon/functions/useBalance.html)
  - [`usePSP22Balances`](https://scio-labs.github.io/use-inkathon/functions/usePSP22Balances.html)
  - [`useContract`](https://scio-labs.github.io/use-inkathon/functions/useContract.html)
  - [`useRegisteredContract`](https://scio-labs.github.io/use-inkathon/functions/useRegisteredContract.html) _(read more below)_
- Contract interaction helper functions with automatic upfront gas estimation, including:
  - [`contractTx`](https://scio-labs.github.io/use-inkathon/functions/contractTx.html)
  - [`contractQuery`](https://scio-labs.github.io/use-inkathon/functions/contractQuery.html)
  - [`decodeOutput`](https://scio-labs.github.io/use-inkathon/functions/decodeOutput.html)
- Constants definitions for Substrate-based chains, wallets, and assets
- Works multichain with live & dynamic chain-switching out of the box

> [!NOTE]  
> Checkout our [TypeDoc Documentation](https://scio-labs.github.io/use-inkathon/) for more details.

## Contract Registry 🗳️

Often when working with smart contracts in the frontend, you have to import the contract metadata multiple times across a project, then determine the matching deployment address for the active chain, and create a `ContractPromise` instance manually each time.

The idea of a _Contract Registry_ is to **define contract metadata & addresses only once and use them everywhere with a simple hook:**

```ts
const { contract } = useRegisteredContract('greeter')
```

### How it works

Start by defining an async `getDeployments` function that returns [`SubstrateDeployment[]`](https://scio-labs.github.io/use-inkathon/interfaces/SubstrateDeployment.html) metadata objects for each contract deployment on each chain.

> [!NOTE]  
> Checkout an advanced example within the ink!athon boilerplate [here](https://github.com/scio-labs/inkathon/blob/main/frontend/src/deployments/deployments.ts) where metadata is imported dynamically based on defined chains and contract identifiers.

```ts
import { alephzeroTestnet, SubstrateDeployment } from '@scio-labs/use-inkathon'

export const getDeployments = async (): Promise<SubstrateDeployment[]> => {
  return [
    {
      contractId: 'greeter',
      networkId: alephzeroTestnet.network,
      abi: await import(`../deployments/metadata.json`),
      address: '5HPwzKmJ6wgs18BEcLdH5P3mULnfnowvRzBtFcgQcwTLVwFc',
    },
  ]
}
```

The function's result passed to the `UseInkathonProvider` provider:

```tsx
<UseInkathonProvider
  appName="My dApp"
  defaultChain={alephzeroTestnet}
  deployments={getDeployments()}
>
  <Component {...pageProps} />
</UseInkathonProvider>
```

Then access the contract as above:

```ts
const { contract } = useRegisteredContract('greeter')
```

---

## Package Development 🛠

**If you want to contribute, please read our [Contributor Guidelines](https://github.com/scio-labs/use-inkathon/blob/main/CONTRIBUTING.md)** 🙏

> **Pre-requisites:**
>
> - Setup Node.js v18 (recommended via [nvm](https://github.com/nvm-sh/nvm))
> - Install [pnpm](https://pnpm.io/installation) (recommended via [Node.js Corepack](https://nodejs.org/api/corepack.html))
> - Clone this repository

```bash
# Install dependencies
pnpm i

# Enable pre-commit hooks
pnpm simple-git-hooks

# Start tsup in development mode (watching)
pnpm dev

# Build the package
pnpm build
```

<details>
<summary><strong>How to import a development version of this package locally?</strong></summary>

Unfortunately, importing this package locally into other local projects requires some manual steps. You need to build & pack this package into a `.tgz`-build and then update this dependency in your other project. These steps must be repeated each time you make changes to this package.

```bash
# 1. [THIS PACKAGE] Generate a .tgz package of the build
pnpm tsup && pnpm pack

# 2. [OTHER PROJECT] Add it as a dependency in your other project like:
#    `"@scio-labs/use-inkathon": "file:../scio-labs-use-inkathon-0.0.X.tgz"`
pnpm add ../use-inkathon/scio-labs-use-inkathon-0.0.X.tgz

# 3. [OTHER PROJECT] Subsequent updates can be done via
pnpm update @scio-labs/use-inkathon --force
```

</details>
