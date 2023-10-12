import { useMemo } from 'react'
import styled from 'styled-components/macro'
import { WeiAmount, WithdrawMessage, constants, msg } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import { TYPE } from 'src/styles/theme'
import { RowCenter } from 'src/components/Row'
import Link from 'src/components/Link'
import { useAddressesQuery } from 'src/state/transactions/hooks'
import useReduceHash from 'src/hooks/useReduceHash'

import { ReactComponent as ExternalLinkIcon } from 'src/images/external-link.svg'
import { ReactComponent as EthereumIcon } from 'src/images/ethereum.svg'
import { getChainInfo } from 'src/constants/chainInfo'
import { rulesSdk } from 'src/lib/rulesWallet/rulesSdk'

// style

const StyledEvent = styled(RowCenter)`
  padding: 12px 20px;
  border-radius: 6px;
  background: ${({ theme }) => theme.bg4};
  gap: 16px;
  word-break: break-all;

  & > img,
  & > svg {
    height: 48px;
    max-width: 48px;
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

const EtherscanLink = styled(Link)`
  & > div {
    display: inline-flex;
    font-family: Inconsolata, monospace;
    font-weight: 500;
    color: ${({ theme }) => theme.primary1};
  }
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

  // reduce l1Recipient
  const reducedL1Recipient = useReduceHash(parsedMessage.l1Recipient)

  return (
    <StyledEvent>
      <EthereumIcon />

      <TYPE.body>
        <Link href={`/user/${fromUser?.slug ?? address}`}>{fromUser?.username ?? address}</Link>
        <br />
        <Trans>withdrawn {parsedAmount.toSignificant(6)} ETH to</Trans>
        <span> </span>
        <EtherscanLink
          target="_blank"
          href={`${getChainInfo(rulesSdk.networkInfos.ethereumChainId)?.explorer}/address/${parsedMessage.l1Recipient}`}
        >
          <RowCenter gap={6}>
            {reducedL1Recipient}
            <StyledExternalLinkIcon />
          </RowCenter>
        </EtherscanLink>
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
    const l2StarkgateAddress = constants.STARKGATE_ADDRESSES[rulesSdk.networkInfos.starknetChainId]
    const l1StarkgateAddress = constants.STARKGATE_ADDRESSES[rulesSdk.networkInfos.ethereumChainId]

    if (fromAddress === l2StarkgateAddress && toAddress === l1StarkgateAddress)
      return msg.parseMessage('starkgate', payload)
    return null
  }, [payload.length])

  // only message supported for the moment
  if (parsedMessage?.type !== 'withdraw') return null

  return <EtherWithdrawMessage address={address} parsedMessage={parsedMessage as WithdrawMessage} />
}
