import { useState, useMemo } from 'react'
import styled from 'styled-components/macro'
import { WeiAmount } from '@rulesorg/sdk-core'
import { t } from '@lingui/macro'

import MarketplaceFilters from 'src/components/Filters/Marketplace'
import Section from 'src/components/Section'
import Column from 'src/components/Column'
import Row, { RowBetween, RowCenter } from 'src/components/Row'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import SortButton, { SortsData } from 'src/components/Button/SortButton'
import { useFiltersModalToggle, useSweepModalToggle } from 'src/state/application/hooks'
import DefaultLayout from 'src/components/Layout'
import { NftCard } from 'src/components/nft/Card'
import CollectionNfts from 'src/components/nft/Collection/CollectionNfts'
import { useCardModels } from 'src/graphql/data/CardModels'
import { BadgeType, CardModelsSortingType, SortingOption } from 'src/graphql/data/__generated__/types-and-hooks'
import { useMarketplaceFilters } from 'src/state/search/hooks'
import { IconButton } from 'src/components/Button'
import { MarketplaceFiltersModal } from 'src/components/FiltersModal'
import * as Icons from 'src/theme/components/Icons'
import * as Text from 'src/theme/components/Text'

import { ReactComponent as HopperIcon } from 'src/images/hopper.svg'
import { darken } from 'polished'
import useCurrentUser from 'src/hooks/useCurrentUser'
import SweepModal from 'src/components/SweepModal'

const StyledSection = styled(Section)`
  width: 100%;
  max-width: unset;
  padding: 0 32px;
  gap: 32px;
  margin: 32px 0 0;
  position: sticky;

  ${({ theme }) => theme.media.small`
    padding: 0 16px;
  `}
`

const HopperIconButton = styled(IconButton)`
  visibility: hidden;

  svg {
    margin-top: 2px; // needed to make it looks better centered
  }

  ${({ theme }) => theme.media.medium`
    visibility: visible;
  `}
`

const FiltersWrapper = styled.div`
  height: fit-content;
  position: sticky;
  top: ${({ theme }) => theme.size.headerHeight + 32}px;
  min-width: 200px;

  ${({ theme }) => theme.media.medium`
    display: none;
  `}
`

const GridWrapper = styled(Column)`
  width: 100%;
`

const GridHeader = styled(RowBetween)`
  margin-bottom: 16px;
  padding: 0 8px;
  align-items: center;
`

const SweepButton = styled.button`
  height: 48px;
  border-radius: 10px;
  position: fixed;
  bottom: 16px;
  right: 24px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #8e2de2 0, #4a00e0 100%);
  outline-width: 0;
  z-index: 999;
  box-shadow: 0 0 8px #00000080;
  border: none;
  outline: none;
  cursor: pointer;

  &:hover {
    background: linear-gradient(135deg, ${darken(0.05, '#8e2de2')} 0, ${darken(0.05, '#4a00e0')} 100%);
  }

  svg {
    width: 28px;
  }
`

// TODO: new sorting support
const useSortsData = (): SortsData<any> =>
  useMemo(
    () => [
      { name: t`Price: low to high`, key: '', desc: false },
      { name: t`Price: high to low`, key: '', desc: true },
    ],
    []
  )

function Marketplace() {
  const [sortIndex, setSortIndex] = useState(0)

  // current user
  const { currentUser } = useCurrentUser()

  // sorts data
  const sortsData = useSortsData()

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // filters
  const marketplaceFilters = useMarketplaceFilters()

  // modals
  const toggleMarketplaceFiltersModal = useFiltersModalToggle()
  const toggleSweepModal = useSweepModalToggle()

  // sort
  const sort = useMemo(
    () => ({
      type: marketplaceFilters.lowSerials ? CardModelsSortingType.LowSerialLowestAsk : CardModelsSortingType.LowestAsk,
      direction: sortsData[sortIndex].desc ? SortingOption.Desc : SortingOption.Asc,
    }),
    [sortIndex, marketplaceFilters.lowSerials]
  )

  const {
    data: cardModels,
    loading,
    hasNext,
    loadMore,
  } = useCardModels({
    filter: {
      seasons: marketplaceFilters.seasons,
      scarcityAbsoluteIds: marketplaceFilters.scarcities,
      maxGweiPrice: '9999999999999999',
    },
    sort,
  })

  const cardModelComponents = useMemo(() => {
    if (!cardModels) return null

    return cardModels.map((cardModel) => {
      const lowestAsk = marketplaceFilters.lowSerials ? cardModel.lowSerialLowestAsk : cardModel.lowestAsk
      const parsedLowestAsk = lowestAsk ? WeiAmount.fromRawAmount(lowestAsk) : undefined

      return (
        <NftCard
          key={cardModel.slug}
          asset={{
            animationUrl: cardModel.animationUrl,
            imageUrl: cardModel.imageUrl,
            tokenId: cardModel.slug,
            scarcity: cardModel.scarcityName,
          }}
          display={{
            href: `/card/${cardModel.slug}`,
            primaryInfo: cardModel.artistName,
            secondaryInfo: t`${cardModel.listedCardsCount} offers`,
            subtitle: parsedLowestAsk
              ? t`from ${parsedLowestAsk.toSignificant(6)} ETH (€${weiAmountToEURValue(parsedLowestAsk)})`
              : undefined,
          }}
          badges={marketplaceFilters.lowSerials ? [{ type: BadgeType.LowSerial, level: 1 }] : undefined}
        />
      )
    })
  }, [cardModels, marketplaceFilters.lowSerials])

  return (
    <>
      <StyledSection>
        <GridHeader>
          <HopperIconButton onClick={toggleMarketplaceFiltersModal} square>
            <HopperIcon />
          </HopperIconButton>

          <SortButton sortsData={sortsData} onChange={setSortIndex} sortIndex={sortIndex} />
        </GridHeader>

        <Row gap={32}>
          <FiltersWrapper>
            <MarketplaceFilters />
          </FiltersWrapper>

          <GridWrapper>
            <CollectionNfts
              next={loadMore}
              hasNext={hasNext ?? false}
              dataLength={cardModels?.length ?? 0}
              loading={loading}
            >
              {cardModelComponents}
            </CollectionNfts>
          </GridWrapper>
        </Row>
      </StyledSection>

      {!!currentUser && (
        <SweepButton onClick={toggleSweepModal}>
          <RowCenter gap={4}>
            <Icons.Sweep />
            <Text.HeadlineSmall>Sweep</Text.HeadlineSmall>
          </RowCenter>
        </SweepButton>
      )}

      <SweepModal />
      <MarketplaceFiltersModal />
    </>
  )
}

Marketplace.withLayout = () => (
  <DefaultLayout>
    <Marketplace />
  </DefaultLayout>
)

export default Marketplace
