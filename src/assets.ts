import { ChainAsset } from '@/types'
import PSP22_ASSETS from './data/PSP22_ASSETS.json'

/**
 * Acknowledgement: PSP22_ASSETS.json is inspired by Subwallet's `ChainAsset.json`
 */
export const allPSP22Assets = PSP22_ASSETS as Record<string, ChainAsset>
