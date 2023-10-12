import { ChainAsset } from '@types'
// PSP22Asset.json is inspired by Subwallet's ChainAsset.json (https://github.com/Koniverse/SubWallet-ChainList/blob/master/packages/chain-list/src/data/ChainAsset.json)
import PSP22_Asset from '../PSP22Asset.json'
export const psp22Asset = PSP22_Asset as Record<string, ChainAsset>
