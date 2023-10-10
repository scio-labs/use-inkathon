export interface ChainAsset {
  originChain: string
  slug: string
  name: string
  symbol: string
  decimals: number
  metadata: Record<any, any> | null
  iconPath: string
}
