import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import useCurrentUser from 'src/hooks/useCurrentUser'
import { RowCenter } from 'src/components/Row'
import Column from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import { PrimaryButton, SecondaryButton } from 'src/components/Button'
import Link from 'src/components/Link'
import Placeholder from 'src/components/Placeholder'
import {
  useOfferModalToggle,
  useCreateOfferModalToggle,
  useCancelOfferModalToggle,
  useAcceptOfferModalToggle,
} from 'src/state/application/hooks'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import CardPendingStatusText from 'src/components/CardPendingStatusText'
import { CardPendingStatus } from 'src/hooks/useCardsPendingStatusMap'
import Avatar from 'src/components/Avatar'

import { ReactComponent as Present } from 'src/images/present.svg'

const StyledAvatar = styled(Avatar)`
  width: 50px;
  height: 50px;
`

const ButtonsWrapper = styled(Column)`
  button {
    width: 100%;
  }
`

const StyledPresent = styled(Present)`
  width: 16px;
  fill: ${({ theme }) => theme.text1};
`

interface CardOwnershipProps {
  ownerSlug: string
  ownerUsername: string
  ownerProfilePictureUrl: string
  ownerProfileFallbackUrl: string
  pendingStatus?: CardPendingStatus
  price?: string
}

export default function CardOwnership({
  ownerSlug,
  ownerUsername,
  ownerProfilePictureUrl,
  ownerProfileFallbackUrl,
  pendingStatus,
  price,
}: CardOwnershipProps) {
  // current user
  const { currentUser } = useCurrentUser()

  // modal
  const toggleOfferModal = useOfferModalToggle()
  const toggleCreateOfferModal = useCreateOfferModalToggle()
  const toggleCancelOfferModal = useCancelOfferModalToggle()
  const toggleAcceptOfferModal = useAcceptOfferModalToggle()

  // price parsing
  const parsedPrice = useMemo(() => (price ? WeiAmount.fromRawAmount(price) : null), [price])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <Column gap={16}>
      <RowCenter gap={12}>
        <Link href={`/user/${ownerSlug}`}>
          <StyledAvatar src={ownerProfilePictureUrl} fallbackSrc={ownerProfileFallbackUrl} />
        </Link>
        <TYPE.body>
          <Trans>
            Belongs to&nbsp;
            <Link href={`/user/${ownerSlug}`} color="text1" underline>
              {ownerUsername}
            </Link>
          </Trans>
        </TYPE.body>
      </RowCenter>
      <ButtonsWrapper gap={12}>
        {!pendingStatus && (parsedPrice || currentUser?.slug === ownerSlug) ? (
          <>
            {currentUser?.slug === ownerSlug && parsedPrice ? (
              <>
                <PrimaryButton onClick={toggleCancelOfferModal} large>
                  <Trans>Close offer</Trans>
                </PrimaryButton>

                <SecondaryButton onClick={toggleCreateOfferModal} large>
                  <Trans>Update price</Trans>
                </SecondaryButton>
              </>
            ) : parsedPrice ? (
              <PrimaryButton onClick={toggleAcceptOfferModal} large>
                <Trans>
                  Buy - {parsedPrice.toSignificant(6)} ETH ({weiAmountToEURValue(parsedPrice)}€)
                </Trans>
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={toggleCreateOfferModal} large>
                <Trans>Place for Sale</Trans>
              </PrimaryButton>
            )}
            {!parsedPrice && (
              <SecondaryButton onClick={toggleOfferModal} large>
                <RowCenter justify="center" gap={4}>
                  <StyledPresent />
                  <Trans>Gift</Trans>
                </RowCenter>
              </SecondaryButton>
            )}
          </>
        ) : (
          <Placeholder>
            {pendingStatus ? (
              <CardPendingStatusText pendingStatus={pendingStatus} />
            ) : (
              <Trans>This card is not on sale.</Trans>
            )}
          </Placeholder>
        )}
      </ButtonsWrapper>
    </Column>
  )
}
