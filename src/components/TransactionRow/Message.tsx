import { useMemo } from 'react'
import styled from 'styled-components'
import { parseMessage, WeiAmount, WithdrawMessage } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import { TYPE } from '@/styles/theme'
import { RowCenter } from '@/components/Row'
import Link from '@/components/Link'
import { desiredChainId } from '@/constants/connectors'
import { networkId, CHAINS } from '@/constants/networks'
import { L2_STARKGATE_ADDRESSES, L1_STARKGATE_ADDRESSES } from '@/constants/addresses'
import { useAddressesQuery } from '@/state/transactions/hooks'

import ExternalLinkIcon from '@/images/external-link.svg'
import EthereumIcon from '@/images/ethereum.svg'

// style

const StyledEvent = styled(RowCenter)`
  padding: 12px 20px;
  border-radius: 3px;
  background: ${({ theme }) => theme.bg5};
  gap: 16px;

  & > img,
  & > svg {
    height: 48px;
  }

  a,
  span {
    font-weight: 500;
  }

  & a:hover {
    text-decoration: underline;
  }
`

const StyledExternalLinkIcon = styled(ExternalLinkIcon)`
  width: 12px;
  height: 12px;
  fill: ${({ theme }) => theme.text1};
`

const ExternalLink = styled(TYPE.body)`
  display: inline-block;
`

// ETHER WITHDRAW MESSAGE

interface EtherWithdrawMessageProps {
  address: string
  parsedMessage: WithdrawMessage
}

function EtherWithdrawMessage({ address, parsedMessage }: EtherWithdrawMessageProps) {
  // query data
  const query = useAddressesQuery([address])

  const fromUser = query.data?.usersByStarknetAddresses?.[0]

  const parsedAmount = useMemo(() => WeiAmount.fromRawAmount(parsedMessage.amount), [parsedMessage.amount])

  return (
    <StyledEvent>
      <EthereumIcon />

      <TYPE.body>
        <Link href={`/user/${fromUser?.slug ?? address}`}>{fromUser?.username ?? address}</Link>
        <br />
        <Trans>withdrawn {parsedAmount.toSignificant(6)} ETH to</Trans>
        <span> </span>
        <Link target="_blank" href={`${CHAINS[desiredChainId].explorerBaseUrl}/address/${parsedMessage.l1Recipient}`}>
          <RowCenter style={{ display: 'inline' }} gap={6}>
            {parsedMessage.l1Recipient}
            <StyledExternalLinkIcon />
          </RowCenter>
        </Link>
      </TYPE.body>
    </StyledEvent>
  )
}

// EVENT MGMT

interface EventProps {
  address: string
  fromAddress: string
  toAddress: string
  payload: string[]
}

export default function Message({ address, fromAddress, toAddress, payload }: EventProps) {
  const parsedMessage = useMemo(() => {
    if (fromAddress === L2_STARKGATE_ADDRESSES[networkId] && toAddress === L1_STARKGATE_ADDRESSES[desiredChainId])
      return parseMessage('starkgate', payload)
    return null
  }, [payload.length])

  // only message supported for the moment
  if (parsedMessage.type !== 'withdraw') return null

  return <EtherWithdrawMessage address={address} parsedMessage={parsedMessage as WithdrawMessage} />
}
