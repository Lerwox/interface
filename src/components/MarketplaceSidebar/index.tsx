import React from 'react'
import styled from 'styled-components'
import { Seasons, ScarcityName } from '@rulesorg/sdk-core'

import Checkbox from '@/components/Checkbox'
import Slider from '@/components/Slider'
import { TYPE } from '@/styles/theme'
import { useMarketplaceFilters, useTiersFilterToggler, useSeasonsFilterToggler } from '@/state/search/hooks'

import Close from '@/images/close.svg'

const StyledClose = styled(Close)`
  display: none;
  right: 18px;
  top: 24px;
  position: absolute;
  cursor: pointer;

  ${({ theme }) => theme.media.medium`
    display: initial;
  `}
`

const StyledMarketplaceSidebar = styled.div`
  background: ${({ theme }) => theme.bg2};
  position: fixed;
  width: 283px;
  top: 57px;
  bottom: 0;
  left: 0;
  z-index: 1;

  ${({ theme }) => theme.media.medium`
    top: 62px;
  `}
`

const SidebarContent = styled.div`
  position: absolute;
  top: 40px;
  bottom: 40px;
  left: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  gap: 28px;

  ${({ theme }) => theme.media.medium`
    top: 64px;
  `}
`

const SidebarTitle = styled(TYPE.body)`
  font-weight: 700;
  margin: 0;
  width 100%;
  text-align: center;
`

const FilterName = styled(TYPE.body)`
  font-weight: 700;
  margin: 0;
`

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

interface MarketplaceSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  dispatch: () => void
}

export default function MarketplaceSidebar({ dispatch, ...props }: MarketplaceSidebarProps) {
  const filters = useMarketplaceFilters()

  const toggleTierFilter = useTiersFilterToggler()
  const toggleSeasonFilter = useSeasonsFilterToggler()

  return (
    <StyledMarketplaceSidebar {...props}>
      <StyledClose onClick={dispatch} />
      <SidebarContent>
        <SidebarTitle>Filters</SidebarTitle>

        <FilterWrapper>
          <FilterName>Seasons</FilterName>
          {Object.keys(Seasons).map((season: string) => (
            <Checkbox
              key={`checkbox-season-${season}`}
              value={filters.seasons.includes(+season)}
              onChange={() => toggleSeasonFilter(+season)}
            >
              <TYPE.body>{Seasons[+season].name}</TYPE.body>
            </Checkbox>
          ))}
        </FilterWrapper>

        <FilterWrapper>
          <FilterName>Scarcities</FilterName>
          {ScarcityName.map((scarcity: string) => (
            <Checkbox
              key={`checkbox-tier-${scarcity}`}
              value={filters.tiers.includes(scarcity)}
              onChange={() => toggleTierFilter(scarcity)}
            >
              <TYPE.body>{scarcity}</TYPE.body>
            </Checkbox>
          ))}
        </FilterWrapper>

        <FilterWrapper>
          <FilterName>Price</FilterName>
          <Slider unit="€" max={100_000} />
        </FilterWrapper>
      </SidebarContent>
    </StyledMarketplaceSidebar>
  )
}
