---
'@scio-labs/use-inkathon': minor
---

Add support for type-safe contract-interactions via `typechain-polkadot`. A new hook `useRegisteredTypedContract` enables easy instantiation with automatic assignment of api instance, network-dependant contract address, and the connected signer. Currently, only queries (read-only) are supported with those instances. – See README.md for more information.
