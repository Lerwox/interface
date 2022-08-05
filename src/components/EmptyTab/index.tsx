import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { ColumnCenter } from '@/components/Column'
import Row from '@/components/Row'
import Card from '@/components/Card'
import Link from '@/components/Link'
import { PrimaryButton } from '@/components/Button'

import Ghost from '@/images/ghost.svg'

const StyledEmptyTab = styled(ColumnCenter)`
  justify-content: center;
  height: 375px;
  gap: 20px;

  svg {
    width: 70px;
    fill: ${({ theme }) => theme.text2};
  }
`

const StyledEmptyTabOfCurrentUser = styled(Row)`
  justify-content: center;
  height: 375px;
  gap: 20px;
  align-items: end;
  justify-content: space-between;

  ${({ theme }) => theme.media.medium`
    justify-content: center;
  `}

  svg {
    width: 70px;
    fill: ${({ theme }) => theme.text2};
  }

  img {
    max-height: 360px;
    max-width: 100%;
    display: block;

    ${({ theme }) => theme.media.medium`
      display: none;
    `}
  }
`

const ImageWrapper = styled.div`
  flex-shrink: 2;
  margin-bottom: -22px;
`

const ActionsWrapper = styled(ColumnCenter)`
  justify-content: center;
  height: 100%;
  gap: 20px;

  button {
    width: 300px;

    ${({ theme }) => theme.media.extraSmall`
      width: 100%;
    `}
  }

  a {
    ${({ theme }) => theme.media.extraSmall`
      width: 100%;
    `}
  }
`

interface EmptyTabProps {
  emptyText: string
}

export default function EmptyTab({ emptyText }: EmptyTabProps) {
  return (
    <Card>
      <StyledEmptyTab>
        <Ghost />
        <TYPE.body>{emptyText}</TYPE.body>
      </StyledEmptyTab>
    </Card>
  )
}

export function EmptyCardsTabOfCurrentUser() {
  return (
    <Card>
      <StyledEmptyTabOfCurrentUser>
        <ImageWrapper>
          <img src="/assets/no-cards-1.png" />
        </ImageWrapper>

        <ActionsWrapper>
          <TYPE.body>
            <Trans>No cards right now...</Trans>
          </TYPE.body>
          <Link href="/marketplace">
            <PrimaryButton large>
              <Trans>Go to the marketplace</Trans>
            </PrimaryButton>
          </Link>
        </ActionsWrapper>

        <ImageWrapper>
          <img src="/assets/no-cards-2.png" />
        </ImageWrapper>
      </StyledEmptyTabOfCurrentUser>
    </Card>
  )
}

export function EmptyPacksTabOfCurrentUser() {
  return (
    <Card>
      <StyledEmptyTabOfCurrentUser>
        <ImageWrapper>
          <img src="/assets/no-packs-1.png" />
        </ImageWrapper>

        <ActionsWrapper>
          <TYPE.body>
            <Trans>No packs right now...</Trans>
          </TYPE.body>
          <Link href="/packs">
            <PrimaryButton large>
              <Trans>Buy a pack</Trans>
            </PrimaryButton>
          </Link>
        </ActionsWrapper>

        <ImageWrapper>
          <img src="/assets/no-packs-2.png" />
        </ImageWrapper>
      </StyledEmptyTabOfCurrentUser>
    </Card>
  )
}
