import { ApiPromise } from '@polkadot/api'
import { CodePromise } from '@polkadot/api-contract'
import { ContractOptions } from '@polkadot/api-contract/types'
import { IKeyringPair } from '@polkadot/types/types'
import { BN, stringCamelCase } from '@polkadot/util'
import { getGasLimit } from './getGasLimit'

/**
 * Uploads & instantiates a contract on-chain.
 */
export const deployContract = async (
  api: ApiPromise,
  account: IKeyringPair | string,
  abi: any,
  wasm: Uint8Array | string | Buffer,
  constructorMethod = 'new',
  args = [] as unknown[],
  options = {} as ContractOptions,
) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<{ address: string; hash: string }>(async (resolve) => {
    const code = new CodePromise(api, abi, wasm)
    const gasLimit = getGasLimit(
      api,
      new BN(1_000_000_000),
      new BN(5_000_000_000_000),
    )
    const constructorFn = code.tx[stringCamelCase(constructorMethod)]
    const unsub = await constructorFn(
      { gasLimit, ...options },
      ...args,
    ).signAndSend(account, ({ contract, status }: any) => {
      if (status?.isInBlock) {
        const hash = abi?.source.hash
        const address = contract.address.toString()
        console.log(`Contract '${abi?.contract.name}' deployed at ${address}`)

        unsub?.()
        resolve({
          address,
          hash,
        })
      }
    })
  })
}
