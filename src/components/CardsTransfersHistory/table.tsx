import { useMemo } from 'react'
import styled from 'styled-components/macro'
import moment from 'moment'
import { useQuery, gql } from '@apollo/client'
import { WeiAmount } from '@rulesorg/sdk-core'
import { Trans, t } from '@lingui/macro'

import { NULL_PRICE } from 'src/constants/misc'
import { TYPE } from 'src/styles/theme'
import Table from 'src/components/Table'
import Avatar from 'src/components/Avatar'
import Link from 'src/components/Link'
import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import useLocationQuery from 'src/hooks/useLocationQuery'

const StyledAvatar = styled(Avatar)`
  width: 36px;
  height: 36px;
`

const StyledTable = styled(Table)`
  margin-top: 22px;

  ${({ theme }) => theme.media.small`
    td:first-child {
      display: none;
    }
  `}
`

const QUERY_TRANSFERS_USERS = gql`
  query ($starknetAddresses: [String!]!) {
    usersByStarknetAddresses(starknetAddresses: $starknetAddresses) {
      slug
      username
      profile {
        pictureUrl(derivative: "width=128")
        fallbackUrl(derivative: "width=128")
      }
      starknetWallet {
        address
      }
    }
  }
`

interface TransfersTableProps {
  transfers?: any[]
  loading: boolean
  error: boolean
  showSerialNumber: boolean
}

export default function TransfersTable({ transfers, loading, error, showSerialNumber }: TransfersTableProps) {
  // query
  const query = useLocationQuery()

  // user table
  const starknetAddresses = useMemo(
    () =>
      (transfers ?? []).reduce<string[]>((acc, hit: any) => {
        if (hit.fromStarknetAddress) acc.push(hit.fromStarknetAddress)
        if (hit.toStarknetAddress) acc.push(hit.toStarknetAddress)

        return acc
      }, []),
    [JSON.stringify(transfers)]
  )

  // usersData
  const usersQuery = useQuery(QUERY_TRANSFERS_USERS, {
    variables: { starknetAddresses },
    skip: !starknetAddresses.length,
  })

  const usersTable = useMemo(
    () =>
      ((usersQuery?.data?.usersByStarknetAddresses ?? []) as any[]).reduce<{ [key: string]: any }>((acc, user: any) => {
        const address = user.starknetWallet.address
        if (!address) return acc

        acc[address] = user
        return acc
      }, {}),
    [usersQuery?.data?.usersByStarknetAddresses]
  )

  // error
  error = error || !!usersQuery.error

  // loading
  loading = loading || !!usersQuery.loading

  // parsed price
  const parsedPrices = useMemo(
    () =>
      (transfers ?? []).map((transfer: any) =>
        transfer.price !== NULL_PRICE ? WeiAmount.fromRawAmount(`0x${transfer.price}`) : null
      ),
    [transfers]
  )

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  return (
    <StyledTable>
      <thead>
        <tr>
          <td />
          <td>
            <TYPE.medium>
              <Trans>Buyer</Trans>
            </TYPE.medium>
          </td>
          <td>
            <TYPE.medium>
              <Trans>Seller</Trans>
            </TYPE.medium>
          </td>
          <td>
            <TYPE.medium>
              <Trans>Date</Trans>
            </TYPE.medium>
          </td>
          {showSerialNumber && (
            <td>
              <TYPE.medium>
                <Trans>Serial</Trans>
              </TYPE.medium>
            </td>
          )}
          <td>
            <TYPE.medium>
              <Trans>Price</Trans>
            </TYPE.medium>
          </td>
        </tr>
      </thead>
      <tbody>
        {!loading && !error && transfers && usersTable ? (
          transfers.map((transfer, index) => (
            <tr key={`rule-nft-history-${index}`}>
              <td>
                {usersTable[transfer.toStarknetAddress] && (
                  <Link href={`/user/${usersTable[transfer.toStarknetAddress].slug}`}>
                    <StyledAvatar
                      src={usersTable[transfer.toStarknetAddress].profile.pictureUrl}
                      fallbackSrc={usersTable[transfer.toStarknetAddress].profile.fallbackUrl}
                    />
                  </Link>
                )}
              </td>
              <td>
                {usersTable[transfer.toStarknetAddress] && (
                  <Link href={`/user/${usersTable[transfer.toStarknetAddress].slug}`}>
                    <TYPE.body clickable>{usersTable[transfer.toStarknetAddress].username}</TYPE.body>
                  </Link>
                )}
              </td>
              <td>
                {transfer.fromStarknetAddress && usersTable[transfer.fromStarknetAddress] ? (
                  <Link href={`/user/${usersTable[transfer.fromStarknetAddress].slug}`}>
                    <TYPE.body clickable>{usersTable[transfer.fromStarknetAddress].username}</TYPE.body>
                  </Link>
                ) : (
                  !transfer.fromStarknetAddress && (
                    <TYPE.body>{transfer.airdrop ? t`Offered by Rules` : t`Pack opening`}</TYPE.body>
                  )
                )}
              </td>
              <td>
                <TYPE.body>{moment(transfer.date).format('DD/MM/YYYY')}</TYPE.body>
              </td>
              {showSerialNumber && (
                <td>
                  <Link href={`/card/${query.get('cardModelSlug')}/${transfer.serialNumber}`}>
                    <TYPE.body clickable>#{transfer.serialNumber}</TYPE.body>
                  </Link>
                </td>
              )}
              <td>
                <TYPE.body>
                  {parsedPrices[index] ? `${weiAmountToEURValue(parsedPrices[index] ?? undefined)}€` : '-'}
                </TYPE.body>
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
