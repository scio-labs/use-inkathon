import { ApiPromise } from '@polkadot/api';

export const RELAY_CHAIN_BLOCK_TIME = 6 * 1000; // 6 seconds in milliseconds
export const CORETIME_CHAIN_BLOCK_TIME = 12 * 1000; // 6 seconds in milliseconds

export const parseHNString = (str: string): number => {
    return parseInt(parseHNStringToString(str));
};

export const parseHNStringToString = (str: string): string => {
    return str.replace(/,/g, '');
};

  /**
 * Get the timestamp for a given block.
 */
export const getBlockTimestamp = async (
    api: ApiPromise,
    height: number
  ): Promise<number> => {
    const [resHeight, resTimestamp] = await Promise.all([
      api.query.system.number(),
      api.query.timestamp.now(),
    ]);
    const currentHeight = parseHNString(resHeight.toString());
    const currentTimestamp = parseHNString(resTimestamp.toString());
    if (height <= currentHeight) {
      const hash = await api.rpc.chain.getBlockHash(height);
      const apiAt = await api.at(hash);
      const timestamp = Number((await apiAt.query.timestamp.now()).toJSON());
      return timestamp;
    } else {
      return currentTimestamp + (height - currentHeight) * RELAY_CHAIN_BLOCK_TIME;
    }
  };

/**
 * Get the time difference between two blocks.
 * Use for future blocks only and approximations only.
*/
export const blocksToTimeFormat = (
  nbOfBlocks: number,
  typeOfChain?: 'PARA' | 'RELAY' | 'LOCAL'
  ): string => {
  // avg 3 seconds per block for local
  // avg 6 seconds per block for relay chains: rococo, kusama, polkadot
  // avg 12 seconds per block for parachains: rococo coretime chain
  let secondsPerBlock: 2 | 6 | 12 = 6;
  if (typeOfChain === 'PARA') {
    secondsPerBlock = 12
  } else if (typeOfChain === 'RELAY') {
    secondsPerBlock = 6
  } else if (typeOfChain === 'LOCAL') {
    secondsPerBlock = 2
  } else {
    secondsPerBlock = 12
  }
  const totalSeconds = nbOfBlocks * secondsPerBlock;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours === 0 && minutes === 0) {
    return `${seconds}s`;
  } else if (hours === 0) {
      return `${minutes}m ${seconds}s`;
  } else {  
  return `${hours}h ${minutes}m ${seconds}s`
  };
}

export const blockTimeToUTC = async (
    api: ApiPromise,
    blockHeight: number
  ): Promise<string> => {
    const timestamp = await getBlockTimestamp(api, blockHeight);
    const date = new Date(timestamp);
    return date.toUTCString();
  };


export const getCurrentBlockNumber = async (
    api: ApiPromise
    ): Promise<number> => {
    const resHeight = await api.query.system.number();
    const currentHeight = parseHNString(resHeight.toString());
    return currentHeight;
}

export const getCurrentBlockTime = async (
    api: ApiPromise
    ): Promise<number> => {
    const resTimestamp = await api.query.timestamp.now();
    const currentTimestamp = parseHNString(resTimestamp.toString());
    return currentTimestamp;
}

export const getCurrentBlockTimeUTC = async (
    api: ApiPromise
    ): Promise<string> => {
    const timestamp = await getCurrentBlockTime(api);
    const date = new Date(timestamp);
    return date.toUTCString();
}

export const getCurrentBlockTimeLocal = async (
    api: ApiPromise
    ): Promise<string> => {
    const timestamp = await getCurrentBlockTime(api);
    const date = new Date(timestamp);
    return date.toLocaleString();
}

export const getCurrentBlockTimeLocalShort = async (
    api: ApiPromise
    ): Promise<string> => {
    const timestamp = await getCurrentBlockTime(api);
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
}

export const getCurrentBlockTimeLocalShortDate = async (
    api: ApiPromise
    ): Promise<string> => {
    const timestamp = await getCurrentBlockTime(api);
    const date = new Date(timestamp);
    return date.toLocaleDateString();
}

