export interface ChainAsset {
  originChain: string
  slug: string
  name: string
  symbol: string
  decimals: number
  assetType: AssetType
  metadata: Record<any, any> | null
  iconPath: string
}

export enum AssetType {
  PSP22 = 'PSP22',
  PSP34 = 'PSP34',
}
