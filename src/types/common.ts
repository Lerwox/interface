import { StarknetWalletLockingReason } from '@rulesorg/sdk-core'

export interface GenieRetrievableEthers {
  amount: string
  l1Recipient: string
}

export interface GenieStarknetWallet {
  address?: string
  publicKey: string
  lockingReason: StarknetWalletLockingReason
  signerEscapeTriggeredAt?: Date
  needsUpgrade: boolean
  rulesPrivateKey: {
    salt: string
    iv: string
    encryptedPrivateKey: string
  }
}

export interface GenieProfile {
  pictureUrl: string
  customAvatarUrl?: string
  fallbackUrl: string
  twitterUsername?: string
  instagramUsername?: string
  isDiscordVisible: boolean
  certified: boolean
  discordMember?: {
    username: string
    discriminator: string
    avatarUrl?: string
  }
}

export interface GenieCurrentUser {
  id: string
  username: string
  slug: string
  email: string
  boughtStarterPack: boolean
  cScore: number
  unreadNotificationsCount: number
  retrievableEthers: Array<GenieRetrievableEthers>
  starknetWallet: GenieStarknetWallet
  hasTwoFactorAuthActivated: boolean
  profile: GenieProfile
}
