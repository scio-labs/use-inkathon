import { ApiPromise } from '@polkadot/api'
import { CodePromise } from '@polkadot/api-contract'
import { ContractOptions } from '@polkadot/api-contract/types'
import { EventRecord, SignedBlock } from '@polkadot/types/interfaces'
import { IKeyringPair } from '@polkadot/types/types'
import { stringCamelCase } from '@polkadot/util'
import { getMaxGasLimit } from './getGasLimit'

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
  return new Promise<{
    address: string
    hash: string
    block: SignedBlock
    blockNumber: number
  }>(async (resolve, reject) => {
    const code = new CodePromise(api, abi, wasm)
    const gasLimit = getMaxGasLimit(api)
    const constructorFn = code.tx[stringCamelCase(constructorMethod)]
    const unsub = await constructorFn(
      { gasLimit, ...options },
      ...args,
    ).signAndSend(account, async ({ events, contract, status }: any) => {
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

        // Determine block number
        const blockHash = status.asInBlock.toHex()
        const block = await api.rpc.chain.getBlock(blockHash)
        const blockNumber = block.block.header.number.toNumber()

        console.log(
          `Contract '${abi?.contract.name}' deployed under ${address} at block #${blockNumber}`,
        )

        return resolve({
          address,
          hash,
          block,
          blockNumber,
        })
      }
    })
  })
}
