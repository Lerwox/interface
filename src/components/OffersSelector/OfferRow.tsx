import React, { useMemo } from 'react'
import styled from 'styled-components'
import { WeiAmount } from '@rulesorg/sdk-core'
import { useRouter } from 'next/router'

import Link from '@/components/Link'
import { useWeiAmountToEURValue } from '@/hooks/useFiatPrice'
import { RadioButton } from '@/components/Button'
import { TYPE } from '@/styles/theme'

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

interface OfferRowProps {
  innerRef?: (node: any) => void
  selected: boolean
  offerId: string
  onSelection: (offerId: string, serialNumber: number) => void
  username?: string
  userSlug?: string
  serialNumber: number
  scarcityMaxLowSerial: number
  price: string
}

const MemoizedOfferRowPropsEqualityCheck = (prevProps: OfferRowProps, nextProps: OfferRowProps) =>
  prevProps.offerId === nextProps.offerId &&
  !!prevProps.innerRef === !!nextProps.innerRef &&
  prevProps.selected === nextProps.selected

const MemoizedOfferRow = React.memo(function OfferRows({
  innerRef,
  selected,
  offerId,
  onSelection,
  username,
  userSlug,
  serialNumber,
  scarcityMaxLowSerial,
  price,
}: OfferRowProps) {
  const { asPath } = useRouter()

  // parsed price
  const parsedPrice = useMemo(() => WeiAmount.fromRawAmount(`0x${price}`), [price])

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <tr ref={innerRef}>
      <RadioButtonWrapper>
        <RadioButton selected={selected} onChange={() => onSelection(offerId, serialNumber)} />
      </RadioButtonWrapper>
      <td onClick={() => onSelection(offerId, serialNumber)}>
        <Price>
          <TYPE.body fontWeight={700}>{`${parsedPrice?.toSignificant(6) ?? 0} ETH`}</TYPE.body>
          <TYPE.body color="text2">{`${(parsedPrice && weiAmountToEURValue(parsedPrice)) ?? 0}€`}</TYPE.body>
        </Price>
      </td>
      <td>
        <Link href={`${asPath.replace(/buy$/, `${serialNumber}`)}`}>
          <TYPE.body color={serialNumber <= scarcityMaxLowSerial ? 'lowSerial' : undefined} clickable>
            #{serialNumber}
          </TYPE.body>
        </Link>
      </td>
      <td>
        {username && (
          <Link href={`/user/${userSlug}`}>
            <TYPE.body clickable>{username}</TYPE.body>
          </Link>
        )}
      </td>
    </tr>
  )
},
MemoizedOfferRowPropsEqualityCheck)

export default MemoizedOfferRow
