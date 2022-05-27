import styled from 'styled-components'
import { Trans, t } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Row from '@/components/Row'
import Column from '@/components/Column'
import { PrimaryButton } from '@/components/Button'

const CardModelImage = styled.img`
  width: 84px;
`

interface CardSelectorBreakdownProps {
  artistName: string
  season: number
  scarcity: string
  pictureUrl: string
  priceEUR?: number
}

export default function OffersSelectorBreakdown({
  artistName,
  season,
  scarcity,
  pictureUrl,
  priceEUR,
}: CardSelectorBreakdownProps) {
  return (
    <Column gap={32}>
      <Row gap={12}>
        <CardModelImage src={pictureUrl} />
        <Column gap={8}>
          <TYPE.body fontWeight={700}>{artistName}</TYPE.body>
          <TYPE.body>
            <Trans>Season {season}</Trans>
          </TYPE.body>
          <Trans id={scarcity} render={({ translation }) => <TYPE.body>{translation}</TYPE.body>} />
        </Column>
      </Row>
      <PrimaryButton large disabled={!priceEUR}>
        {priceEUR ? t`Acheter - ${priceEUR}€` : t`Select a card`}
      </PrimaryButton>
    </Column>
  )
}
