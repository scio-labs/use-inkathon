# @scio-labs/use-inkathon

## 0.8.0

### Minor Changes

- [#59](https://github.com/scio-labs/use-inkathon/pull/59) [`7865a62`](https://github.com/scio-labs/use-inkathon/commit/7865a623c0df66be91881a8c7a4b178448baa7c0) Thanks [@peetzweg](https://github.com/peetzweg)! - throws Error when trying to access unavailable contract deployment

- [#60](https://github.com/scio-labs/use-inkathon/pull/60) [`2e23a13`](https://github.com/scio-labs/use-inkathon/commit/2e23a13974e80a54e91a315e8d21b404610d6b2c) Thanks [@peetzweg](https://github.com/peetzweg)! - marks `rococo` chains data as deprecated and should be replaced with `contracts`, as `rococo` is the testnet relay chain not the smart contracts chain users interact with

### Patch Changes

- [#61](https://github.com/scio-labs/use-inkathon/pull/61) [`1c4abe8`](https://github.com/scio-labs/use-inkathon/commit/1c4abe87503b13e241c2c44342ab445761caf546) Thanks [@wottpal](https://github.com/wottpal)! - Add ternoa network (mainnet & testnet)

## 0.7.0

### Minor Changes

- [#57](https://github.com/scio-labs/use-inkathon/pull/57) [`7d356d7`](https://github.com/scio-labs/use-inkathon/commit/7d356d745073ea27e3daf56af379cb9ba6811d28) Thanks [@wottpal](https://github.com/wottpal)! - Add support for type-safe contract-interactions via `typechain-polkadot`. A new hook `useRegisteredTypedContract` enables easy instantiation with automatic assignment of api instance, network-dependant contract address, and the connected signer. Currently, only queries (read-only) are supported with those instances. – See README.md for more information.

## 0.6.3

### Patch Changes

- [`decead0`](https://github.com/scio-labs/use-inkathon/commit/decead01197cf92d28437d1cb982329e3b8aa019) Thanks [@wottpal](https://github.com/wottpal)! - Add & export explicit return type definition for `deployContract` (`DeployedContract`).

## 0.6.2

### Patch Changes

- [#52](https://github.com/scio-labs/use-inkathon/pull/52) [`646cc1b`](https://github.com/scio-labs/use-inkathon/commit/646cc1be6e79514e3956e9591f85c6c37113f594) Thanks [@Leechael](https://github.com/Leechael)! - Update Phala testnet endpoint URL

## 0.6.1

### Patch Changes

- [`17814f3`](https://github.com/scio-labs/use-inkathon/commit/17814f3ad8d05418dd9d8874637e22f14a535897) Thanks [@wottpal](https://github.com/wottpal)! - Minor types fix & Updates (i.e. to Node 20).

## 0.6.0

### Minor Changes

- [`2e5bc70`](https://github.com/scio-labs/use-inkathon/commit/2e5bc70a4b04825c52044abf0783c2f37437c706) Thanks [@wottpal](https://github.com/wottpal)! - Enable sub-path package imports (e.g. via `@scio-labs/use-inkathon/helpers`) for better ssr compatability.

### Patch Changes

- [`0a0565f`](https://github.com/scio-labs/use-inkathon/commit/0a0565f48af4ec2a48a43635a6024d388db7dec5) Thanks [@wottpal](https://github.com/wottpal)! - Wait for crypto APIs to be ready to prevent polkadot.js initialization issues.

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
