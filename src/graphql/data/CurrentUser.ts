import { useCallback, useMemo } from 'react'
import gql from 'graphql-tag'

import { GenieCurrentUser, GenieProfile } from '@/types'
import { CurrentUser, useCurrentUserQuery } from './__generated__/types-and-hooks'
import { StarknetWalletLockingReason } from '@rulesorg/sdk-core'

gql`
  query CurrentUser {
    currentUser {
      id
      username
      email
      slug
      boughtStarterPack
      cScore
      unreadNotificationsCount
      retrievableEthers {
        amount
        l1Recipient
      }
      starknetWallet {
        address
        publicKey
        signerEscapeTriggeredAt
        lockingReason
        needsUpgrade
        rulesPrivateKey {
          salt
          iv
          encryptedPrivateKey
        }
      }
      hasTwoFactorAuthActivated
      profile {
        pictureUrl(derivative: "width=320")
        customAvatarUrl(derivative: "width=320")
        fallbackUrl(derivative: "width=320")
        twitterUsername
        instagramUsername
        isDiscordVisible
        certified
        discordMember {
          username
          discriminator
          avatarUrl(derivative: "width=320")
          guildAvatarUrl(derivative: "width=320")
        }
      }
    }
  }
`

export function formatCurrentUserQueryData(queryCurrentUser: NonNullable<CurrentUser>): GenieCurrentUser | null {
  if (!queryCurrentUser) return null

  const queryStarknetWallet = queryCurrentUser.starknetWallet
  const queryProfile = queryCurrentUser.profile

  if (!queryStarknetWallet.rulesPrivateKey) throw 'No private key found on current user'

  let discordMember: GenieProfile['discordMember']
  if (queryProfile.discordMember) {
    discordMember = {
      username: queryProfile.discordMember.username ?? '',
      discriminator: queryProfile.discordMember.discriminator ?? '',
      avatarUrl: queryProfile.discordMember.guildAvatarUrl ?? queryProfile.discordMember.avatarUrl,
    }
  }

  return {
    id: queryCurrentUser.id,
    username: queryCurrentUser.username,
    slug: queryCurrentUser.slug,
    email: queryCurrentUser.email,
    boughtStarterPack: queryCurrentUser.boughtStarterPack,
    cScore: queryCurrentUser.cScore,
    unreadNotificationsCount: queryCurrentUser.unreadNotificationsCount,
    hasTwoFactorAuthActivated: queryCurrentUser.hasTwoFactorAuthActivated,
    retrievableEthers: queryCurrentUser.retrievableEthers,

    starknetWallet: {
      address: queryStarknetWallet.address,
      publicKey: queryStarknetWallet.publicKey,
      // cannot do better with how bad enums are handled in graphql
      lockingReason: queryStarknetWallet.lockingReason as any as StarknetWalletLockingReason,
      needsUpgrade: queryStarknetWallet.needsUpgrade,
      rulesPrivateKey: queryStarknetWallet.rulesPrivateKey,
    },

    profile: {
      pictureUrl: queryProfile.pictureUrl,
      customAvatarUrl: queryProfile.customAvatarUrl,
      fallbackUrl: queryProfile.fallbackUrl,
      twitterUsername: queryProfile.twitterUsername,
      instagramUsername: queryProfile.instagramUsername,
      isDiscordVisible: queryProfile.isDiscordVisible,
      certified: queryProfile.certified,
      discordMember,
    },
  }
}

export function useCurrentUser(skip?: boolean) {
  const { data: queryData, loading, fetchMore } = useCurrentUserQuery({ skip })

  const refresh = useCallback(() => {
    fetchMore({})
  }, [fetchMore])

  const queryCurrentUser = queryData?.currentUser as NonNullable<CurrentUser>
  return useMemo(() => {
    return {
      data: formatCurrentUserQueryData(queryCurrentUser),
      refresh,
      loading,
    }
  }, [loading, queryCurrentUser])
}
