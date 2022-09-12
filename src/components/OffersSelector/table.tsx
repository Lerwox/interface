import { useMemo } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Table from '@/components/Table'
import { RadioButton } from '@/components/Button'
import Caret from '@/components/Caret'
import Link from '@/components/Link'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import tryParseWeiAmount from '@/utils/tryParseWeiAmount'

const StyledTable = styled(Table)`
  margin-top: 22px;

  ${({ theme }) => theme.media.medium`
    thead td:last-child {
      display: none;
    }
  `}
`

const StyledCaret = styled(Caret)`
  width: 10px;
  height: 10px;
  margin-left: 8px;
`

const RadioButtonWrapper = styled.td`
  width: 72px;

  ${({ theme }) => theme.media.medium`
    width: 48px;
  `}

  ${({ theme }) => theme.media.small`
    padding-left: 12px !important;
    padding-right: 8px !important;
  `}
`

const Price = styled.div`
  display: flex;
  gap: 8px;

  div {
    white-space: nowrap;
  }

  ${({ theme }) => theme.media.small`
    flex-direction: column;
    gap: 4px;
    padding-right: 12px;
  `}
`

interface OffersTableProps {
  offers: any[]
  usersTable: { [key: string]: any }
  loading: boolean
  error: boolean
  selectedOffer: any | null
  selectOffer: (offer: any | null) => void
  sortDesc: boolean
  toggleSort: () => void
}

export default function OffersTable({
  offers,
  usersTable,
  loading,
  error,
  selectedOffer,
  selectOffer,
  sortDesc,
  toggleSort,
}: OffersTableProps) {
  const { asPath } = useRouter()

  // parsed price
  const parsedPrices = useMemo(() => offers.map((offer: any) => tryParseWeiAmount(offer.price.toString())), [offers])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <StyledTable>
      <thead>
        <tr>
          <td />
          <td>
            <TYPE.medium onClick={toggleSort} style={{ cursor: 'pointer' }}>
              <Trans>Price</Trans>
              <StyledCaret direction={sortDesc ? 'bottom' : 'top'} filled />
            </TYPE.medium>
          </td>
          <td>
            <TYPE.medium>
              <Trans>Serial</Trans>
            </TYPE.medium>
          </td>
          <td>
            <TYPE.medium>
              <Trans>Seller</Trans>
            </TYPE.medium>
          </td>
          <td style={{ width: '100px' }} />
        </tr>
      </thead>
      <tbody>
        {offers.length && Object.keys(usersTable).length ? (
          offers.map((offer: any, index) => (
            <tr key={`offer-${index}`}>
              <RadioButtonWrapper>
                <RadioButton
                  selected={offer.serialNumber === selectedOffer?.serialNumber}
                  onChange={() => selectOffer({ serialNumber: offer.serialNumber, parsedPrice: parsedPrices[index] })}
                />
              </RadioButtonWrapper>
              <td onClick={() => selectOffer({ serialNumber: offer.serialNumber, parsedPrice: parsedPrices[index] })}>
                <Price>
                  <TYPE.body fontWeight={700}>{`${parsedPrices[index]?.toSignificant(6) ?? 0} ETH`}</TYPE.body>
                  <TYPE.body color="text2">
                    {`${(parsedPrices[index] && weiAmountToEURValue(parsedPrices[index])) ?? 0}€`}
                  </TYPE.body>
                </Price>
              </td>
              <td>
                <Link href={`${asPath.replace(/buy$/, offer.serialNumber)}`}>
                  <TYPE.body clickable>#{offer.serialNumber}</TYPE.body>
                </Link>
              </td>
              <td>
                <Link href={`/user/${usersTable[offer.sellerUserId].slug}`}>
                  <TYPE.body clickable>{usersTable[offer.sellerUserId].username}</TYPE.body>
                </Link>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td>
              <TYPE.body>{error ? 'Error' : loading ? 'Loading' : ''}</TYPE.body>
            </td>
          </tr>
        )}
      </tbody>
    </StyledTable>
  )
}
