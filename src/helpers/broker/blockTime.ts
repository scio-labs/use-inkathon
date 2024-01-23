import { ApiPromise } from '@polkadot/api'

export const RELAY_CHAIN_BLOCK_TIME = 6 * 1000 // 6 seconds in milliseconds
export const CORETIME_CHAIN_BLOCK_TIME = 12 * 1000 // 6 seconds in milliseconds

export const parseHNString = (str: string): number => {
  return parseInt(parseHNStringToString(str))
}

export const parseHNStringToString = (str: string): string => {
  return str.replace(/,/g, '')
}

/**
 * Get the timestamp for a given block.
 */
export const getBlockTimestamp = async (
  api: ApiPromise | undefined,
  height: number,
): Promise<number | null> => {
  const [resHeight, resTimestamp] = await Promise.all([
    api?.query.system.number(),
    api?.query.timestamp.now(),
  ])
  const currentHeight = parseHNString(resHeight ? resHeight.toString() : '')
  const currentTimestamp = parseHNString(resTimestamp ? resTimestamp.toString() : '')
  if (height <= currentHeight && api) {
    const hash = await api.rpc.chain.getBlockHash(height)
    const apiAt = await api.at(hash)
    const timestampCodec = await apiAt.query.timestamp.now()
    const timestamp = timestampCodec ? Number(timestampCodec.toString()) : null
    return timestamp
  } else {
    return currentTimestamp + (height - currentHeight) * RELAY_CHAIN_BLOCK_TIME
  }
}

/**
 * Get the time difference between two blocks.
 * Use for future blocks only and approximations only.
 */
export const blocksToTimeFormat = (
  nbOfBlocks: number,
  typeOfChain?: 'PARA' | 'RELAY' | 'LOCAL',
): string => {
  let secondsPerBlock: number = 6 // Default value for relay chain
  if (typeOfChain === 'PARA') {
    secondsPerBlock = 12 // Parachain
  } else if (typeOfChain === 'RELAY') {
    secondsPerBlock = 6 // Relay chain
  } else if (typeOfChain === 'LOCAL') {
    secondsPerBlock = 2 // Local chain
  }

  const totalSeconds = nbOfBlocks * secondsPerBlock
  const days = Math.floor(totalSeconds / (24 * 3600))
  const hours = Math.floor((totalSeconds - days * 24 * 3600) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (days > 0) {
    return `${days}days ${hours}hours ${minutes}min ${seconds}sec`
  } else if (hours > 0) {
    return `${hours}hours ${minutes}min ${seconds}sec`
  } else if (minutes > 0) {
    return `${minutes}min ${seconds}sec`
  } else {
    return `${seconds}sec`
  }
}

export const blockTimeToUTC = async (
  api: ApiPromise | undefined,
  blockHeight: number,
): Promise<string | null> => {
  if (!api) {
    return null
  }
  const timestamp = await getBlockTimestamp(api, blockHeight)
  const date = timestamp ? new Date(timestamp) : null
  const utcString = date ? date.toUTCString() : null // Corrected toUTCString method call
  return utcString
}

export const getCurrentBlockNumber = async (api: ApiPromise): Promise<number> => {
  const resHeight = await api.query.system.number()
  const currentHeight = parseHNString(resHeight.toString())
  return currentHeight
}

export const getCurrentBlockTime = async (api: ApiPromise): Promise<number> => {
  const resTimestamp = await api.query.timestamp.now()
  const currentTimestamp = parseHNString(resTimestamp.toString())
  return currentTimestamp
}

export const getCurrentBlockTimeUTC = async (api: ApiPromise): Promise<string> => {
  const timestamp = await getCurrentBlockTime(api)
  const date = new Date(timestamp)
  return date.toUTCString()
}

export const getCurrentBlockTimeLocal = async (api: ApiPromise): Promise<string> => {
  const timestamp = await getCurrentBlockTime(api)
  const date = new Date(timestamp)
  return date.toLocaleString()
}

export const getCurrentBlockTimeLocalShort = async (api: ApiPromise): Promise<string> => {
  const timestamp = await getCurrentBlockTime(api)
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

export const getCurrentBlockTimeLocalShortDate = async (api: ApiPromise): Promise<string> => {
  const timestamp = await getCurrentBlockTime(api)
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}
