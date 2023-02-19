import { ApiPromise } from '@polkadot/api'
import { CodePromise } from '@polkadot/api-contract'
import { ContractOptions } from '@polkadot/api-contract/types'
import { EventRecord } from '@polkadot/types/interfaces'
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
  return new Promise<{ address: string; hash: string }>(
    async (resolve, reject) => {
      const code = new CodePromise(api, abi, wasm)
      const gasLimit = getGasLimit(
        api,
        new BN(100_000_000_000),
        new BN(5_000_000_000_000),
      )
      const constructorFn = code.tx[stringCamelCase(constructorMethod)]
      const unsub = await constructorFn(
        { gasLimit, ...options },
        ...args,
      ).signAndSend(account, ({ events, contract, status }: any) => {
        if (status?.isInBlock) {
          unsub?.()

          const extrinsicFailedEvent = events.find(
            ({ event: { method } }: any) => method === 'ExtrinsicFailed',
          ) as EventRecord
          if (!!extrinsicFailedEvent || !contract?.address) {
            console.error(
              `Contract '${abi?.contract.name}' could not be deployed`,
              extrinsicFailedEvent?.event?.data?.toHuman(),
            )
            return reject()
          }

          const hash = abi?.source.hash
          const address = contract.address.toString()
          console.log(`Contract '${abi?.contract.name}' deployed at ${address}`)

          return resolve({
            address,
            hash,
          })
        }
      })
    },
  )
}
