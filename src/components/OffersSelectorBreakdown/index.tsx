import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { Trans, t } from '@lingui/macro'
import { WeiAmount } from '@rulesorg/sdk-core'

import { TYPE } from 'src/styles/theme'
import Row from 'src/components/Row'
import Column from 'src/components/Column'
import { PrimaryButton } from 'src/components/Button'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import AcceptOfferModal from 'src/components/MarketplaceModal/AcceptOffer'
import { useAcceptOfferModalToggle } from 'src/state/application/hooks'

const CardModelImage = styled.img`
  width: 84px;
  border-radius: 5px;
`

interface OffersSelectorBreakdownProps {
  artistName: string
  season: number
  scarcityName: string
  pictureUrl: string
  serialNumbers: number[]
  price: string
}

export default function OffersSelectorBreakdown({
  artistName,
  season,
  scarcityName,
  pictureUrl,
  serialNumbers,
  price,
}: OffersSelectorBreakdownProps) {
  // modal
  const toggleAcceptOfferModal = useAcceptOfferModalToggle()

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // price
  const parsedPrice = useMemo(() => WeiAmount.fromRawAmount(price), [price])

  return (
    <>
      <Column gap={32}>
        <Row gap={12}>
          <CardModelImage src={pictureUrl} />
          <Column gap={8}>
            <TYPE.body fontWeight={700}>{artistName}</TYPE.body>
            <TYPE.body>
              <Trans>Season {season}</Trans>
            </TYPE.body>
            <TYPE.body>
              <Trans id={scarcityName}>{scarcityName}</Trans>
            </TYPE.body>
          </Column>
        </Row>
        <PrimaryButton onClick={toggleAcceptOfferModal} disabled={!serialNumbers.length} large>
          {serialNumbers.length
            ? t`Buy - ${parsedPrice.toSignificant(6)} ETH (${weiAmountToEURValue(parsedPrice) ?? 0}€)`
            : t`Select a card`}
        </PrimaryButton>
      </Column>

      {price && (
        <AcceptOfferModal
          artistName={artistName}
          scarcityName={scarcityName}
          season={season}
          serialNumbers={serialNumbers}
          pictureUrl={pictureUrl}
          price={price}
        />
      )}
    </>
  )
}
