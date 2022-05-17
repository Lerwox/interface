import { useRouter } from 'next/router'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import Table from '@/components/Table'
import { RadioButton } from '@/components/Button'
import Caret from '@/components/Caret'
import Link from '@/components/Link'
import { useEtherEURPrice } from '@/hooks/useFiatPrice'

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
    padding-left: 16px !important;
    padding-right: 16px !important;
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

  const etherEURprice = useEtherEURPrice()

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
          offers.map((offer: any, index) => {
            const price =
              !!offer.price && etherEURprice
                ? `${WeiAmount.fromEtherAmount(offer.price).multiply(Math.round(etherEURprice)).toFixed(2)}`
                : null
            const offerToSelect = { serialNumber: offer.serialNumber, price }

            return (
              <tr key={`offer-${index}`}>
                <RadioButtonWrapper>
                  <RadioButton
                    selected={offer.serialNumber === selectedOffer?.serialNumber}
                    onChange={() => selectOffer(offerToSelect)}
                  />
                </RadioButtonWrapper>
                <td>
                  <TYPE.body fontWeight={700} onClick={() => selectOffer(offerToSelect)}>
                    {price ? `${price}€` : '-'}
                  </TYPE.body>
                </td>
                <td>
                  <Link href={`${asPath.replace(/buy$/, offer.serialNumber)}`}>
                    <TYPE.body clickable>#{offer.serialNumber}</TYPE.body>
                  </Link>
                </td>
                <td>
                  <Link href={`/user/${usersTable[offer.fromUserId].slug}`}>
                    <TYPE.body clickable>{usersTable[offer.fromUserId].username}</TYPE.body>
                  </Link>
                </td>
              </tr>
            )
          })
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
