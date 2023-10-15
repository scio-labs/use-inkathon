import { ChainAsset } from '@/types'
import PSP22_Asset from '../data/PSP22_ASSETS.json'

/**
 * Acknowledgement: PSP22_Asset.json is inspired by Subwallet's `ChainAsset.json`
 */
export const psp22Asset = PSP22_Asset as Record<string, ChainAsset>
