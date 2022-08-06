import { SupportedNetworks, SupportedChainIds } from './networks'

export type AddressesMap = {
  [network: string]: string
  [chainId: number]: string
}

export const MULTICALL_ADDRESSES: AddressesMap = {
  [SupportedNetworks.GOERLI]: '0x042a12c5a641619a6c58e623d5735273cdfb0e13df72c4bacb4e188892034bd6',
  [SupportedNetworks.MAINNET]: '0x0740a7a14618bb7e4688d10059bc42104d22c315bb647130630c77d3b6d3ee50',
}

export const ETH_ADDRESSES: AddressesMap = {
  [SupportedNetworks.GOERLI]: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  [SupportedNetworks.MAINNET]: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
}

export const STARKGATE_ADDRESSES: AddressesMap = {
  [SupportedChainIds.GOERLI]: '0xc3511006C04EF1d78af4C8E0e74Ec18A6E64Ff9e',
  [SupportedChainIds.MAINNET]: '0xae0Ee0A63A2cE6BaeEFFE56e7714FB4EFE48D419',
}
