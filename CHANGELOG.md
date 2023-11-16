# @scio-labs/use-inkathon

## 0.5.0

### Minor Changes

- [#47](https://github.com/scio-labs/use-inkathon/pull/47) [`64f6e51`](https://github.com/scio-labs/use-inkathon/commit/64f6e51a0d529541cdd0464ccc2af18bb21564c9) Thanks [@ical10](https://github.com/ical10)! - Improve PSP22 balance helpers to only fetch tokens applicable for the active chain.

- [#47](https://github.com/scio-labs/use-inkathon/pull/47) [`35d0f00`](https://github.com/scio-labs/use-inkathon/commit/35d0f006e3cc8fd3a1a2d92c097a28993be5331b) Thanks [@ical10](https://github.com/ical10)! - - usePSP22Balances checks if `originChain` matches `activeChain` before fetching PSP22 tokens balance.
  - Improve formats and add INW testnet contract address on `PSP22_ASSETS.json`.

### Patch Changes

- [#47](https://github.com/scio-labs/use-inkathon/pull/47) [`ca9ce54`](https://github.com/scio-labs/use-inkathon/commit/ca9ce5473ad36b368ab89663757b2b32388a5166) Thanks [@ical10](https://github.com/ical10)! - Improve fetching of PSP22 balances.

## 0.4.4

### Patch Changes

- [`b9cfa60`](https://github.com/scio-labs/use-inkathon/commit/b9cfa60b1bc3eb2424d3fd41f68ee3e04631b645) Thanks [@wottpal](https://github.com/wottpal)! - Rename chain id `t0rn` to `t0rn-testnet` for consistency.

## 0.4.3

### Patch Changes

- [`8333727`](https://github.com/scio-labs/use-inkathon/commit/8333727b78fad945b8f28b53970454d6aa3f9099) Thanks [@wottpal](https://github.com/wottpal)! - Build `NightlyConnectAdapter` non-lazy when (re)connecting on init.

## 0.4.2

### Patch Changes

- [`d01b9f3`](https://github.com/scio-labs/use-inkathon/commit/d01b9f334223eb64c1fc80c73017f382c490bc53) Thanks [@wottpal](https://github.com/wottpal)! - Fix `isWalletInstalled` declaration to be synchronous again.

## 0.4.1

### Patch Changes

- [`77a1904`](https://github.com/scio-labs/use-inkathon/commit/77a19042daf47fe7b6f646504336a5942fbb3f65) Thanks [@wottpal](https://github.com/wottpal)! - Fix Next.js module import error by making `nightlylabs/wallet-selector-polkadot` a normal peer dependency (non-option) for now. Let's re-evaluate this in the future.

## 0.4.0

### Minor Changes

- [`020aeb1`](https://github.com/scio-labs/use-inkathon/commit/020aeb1900dee1ea449df061f919bb3d7f842db4) Thanks [@wottpal](https://github.com/wottpal)! - Add support for NightlyConnect on Aleph Zero. This is a WalletConnect-like connection dialog for using the Nightly Wallet mobile app or browser extension. IMPORTANT: To use it, install the optional peer-dependency `@nightlylabs/wallet-selector-polkadot`.

- [`81da31b`](https://github.com/scio-labs/use-inkathon/commit/81da31bfeafecfe7d8e531c14553f975479a9c05) Thanks [@wottpal](https://github.com/wottpal)! - BREAKING: `enableWallet` is now async and needs to be awaited. If you were only using the provided `connect` function, nothing changes for you.

## 0.3.0

### Minor Changes

- [`73b3f53`](https://github.com/scio-labs/use-inkathon/commit/73b3f536a41fe84b71cc33c294fc3cd9badfcf27) Thanks [@wottpal](https://github.com/wottpal)! - Refactor React (TS) example components and add dialog component to transfer native tokens that showcases `transferBalance`.

- [`8fdb64f`](https://github.com/scio-labs/use-inkathon/commit/8fdb64fe0e1f84809ccc435a9bc4b2bfec292cfc) Thanks [@wottpal](https://github.com/wottpal)! - Improve transfer & contract tx utils (i.e. `transferBalance`, `transferFullBalance`, `contractTx`) with better error decoding and minimum balance checks upfront.

## 0.2.0

### Minor Changes

- [#36](https://github.com/scio-labs/use-inkathon/pull/36) [`a8e633d`](https://github.com/scio-labs/use-inkathon/commit/a8e633d95329d7b9661e0fa7f6e9a8154c020e5d) Thanks [@ical10](https://github.com/ical10)! - Added native support for more !ink compatible testnets (t0rn, Bit.Country, Peaq, Pendulum, Phala) and mainnets (Khala, Phala, Amplitude, Pendulum)

## 0.1.1

### Patch Changes

- [#38](https://github.com/scio-labs/use-inkathon/pull/38) [`9542a0c`](https://github.com/scio-labs/use-inkathon/commit/9542a0c59e0e1dd9c7c626ce3a33f9c389737181) Thanks [@wottpal](https://github.com/wottpal)! - Add example packages (Vanilla React & Basic Scripts) to the workspace for development ease and demonstration purposes.

- [#38](https://github.com/scio-labs/use-inkathon/pull/38) [`bd57d66`](https://github.com/scio-labs/use-inkathon/commit/bd57d66b61774dfa78af67003afd20c3b415f8a5) Thanks [@wottpal](https://github.com/wottpal)! - Fix the incorrect Rococo Contracts node RPC URL

## 0.1.0

### Minor Changes

- [#32](https://github.com/scio-labs/use-inkathon/pull/32) [`4f7f0c8`](https://github.com/scio-labs/use-inkathon/commit/4f7f0c8016511f331c79d367420ffb62f904834a) Thanks [@wottpal](https://github.com/wottpal)! - Complete README overhaul and addition of CONTRIBUTING guidelines

- [#32](https://github.com/scio-labs/use-inkathon/pull/32) [`875e1bc`](https://github.com/scio-labs/use-inkathon/commit/875e1bc4a7f1706b68a40f99dfa042a563945ab5) Thanks [@wottpal](https://github.com/wottpal)! - Types refactorings into dedicated files

- [#32](https://github.com/scio-labs/use-inkathon/pull/32) [`6ac406a`](https://github.com/scio-labs/use-inkathon/commit/6ac406aedba29aed349721438864ad53374fafca) Thanks [@wottpal](https://github.com/wottpal)! - Setup & workspace improvements
