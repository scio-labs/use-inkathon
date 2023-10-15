export interface SubstrateWallet {
  id: string
  name: string
  platforms: [SubstrateWalletPlatform, ...SubstrateWalletPlatform[]]
  urls: {
    website: string
    chromeExtension?: string
    firefoxExtension?: string
    iosApp?: string
    androidApp?: string
  }
  logoUrls: [string, ...string[]]
}
export enum SubstrateWalletPlatform {
  Browser = 'browser',
  Android = 'android',
  iOS = 'ios',
}
