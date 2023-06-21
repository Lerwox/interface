import { useMemo } from 'react'
import { WeiAmount, constants } from '@rulesorg/sdk-core'
import { Trans } from '@lingui/macro'

import { useWeiAmountToEURValue } from 'src/hooks/useFiatPrice'
import { useETHBalance, useIsDeployed, useSignerEscapeActivationDate } from 'src/state/wallet/hooks'
import { InfoCard } from '../Card'
import * as Text from 'src/theme/components/Text'
import { Column, Row } from 'src/theme/components/Flex'
import * as Icons from 'src/theme/components/Icons'
import Box from 'src/theme/components/Box'
import useRulesAccount from 'src/hooks/useRulesAccount'

interface SignerEscapeProps {
  old?: boolean
}

export default function SignerEscape({ old = false }: SignerEscapeProps) {
  // Address to use
  const { address: newAddress, oldAddress } = useRulesAccount()
  const address = old ? oldAddress : newAddress

  // balance
  const balance = useETHBalance(address)

  // activation date
  const activeDate = useSignerEscapeActivationDate(address)

  // is deployed
  const deployed = useIsDeployed(address)

  // fiat
  const weiAmountToEURValue = useWeiAmountToEURValue()

  // signer escape
  const needsDeposit = useMemo(() => {
    if (!balance || activeDate === undefined) return true

    return balance.lessThan(constants.MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER) && !activeDate
  }, [balance, activeDate])

  const minimumWeiAmountToEscapeSigner = useMemo(
    () => WeiAmount.fromRawAmount(constants.MINIMUM_ETH_BALANCE_TO_ESCAPE_SIGNER),
    []
  )

  const daysBeforeEscape = useMemo(() => {
    // full security period if escape is not triggered yet
    if (!activeDate) return constants.ESCAPE_SECURITY_PERIOD / 24 / 60 / 60 // nb of days

    const difference = +new Date() - +new Date(activeDate)
    return Math.max(Math.ceil((constants.ESCAPE_SECURITY_PERIOD - difference / 1000) / 24 / 60 / 60), 1)
  }, [activeDate])

  // returns

  return (
    <InfoCard $alert>
      <Column gap={'16'} textAlign={'left'}>
        <Text.Body>
          <Trans>
            You have recently changed your password. For security reasons, you no longer have access to some Rules
            features.
          </Trans>
        </Text.Body>

        <Text.Body>
          <Trans>To regain full access to the app you must follow these steps:</Trans>
        </Text.Body>
        <Column gap={'4'}>
          <Row gap={'8'}>
            {!deployed ? (
              <Text.HeadlineSmall>-</Text.HeadlineSmall>
            ) : (
              <Box color={'accent'}>
                <Icons.Checkmark width={'16'} />
              </Box>
            )}

            <Text.HeadlineSmall>
              <Trans>deploy your wallet</Trans>
            </Text.HeadlineSmall>
          </Row>

          <Row gap={'8'}>
            {needsDeposit ? (
              <Text.HeadlineSmall>-</Text.HeadlineSmall>
            ) : (
              <Box color={'accent'}>
                <Icons.Checkmark width={'16'} />
              </Box>
            )}

            <Text.HeadlineSmall>
              <Trans>
                deposit{' '}
                <strong>
                  {minimumWeiAmountToEscapeSigner.toSignificant(18)} ETH (
                  {weiAmountToEURValue(minimumWeiAmountToEscapeSigner)}
                  €)
                </strong>
              </Trans>
            </Text.HeadlineSmall>
          </Row>

          <Row gap={'8'}>
            <Text.HeadlineSmall>-</Text.HeadlineSmall>

            <Text.HeadlineSmall>
              <Trans>wait {daysBeforeEscape} days</Trans>
            </Text.HeadlineSmall>
          </Row>
        </Column>
      </Column>
    </InfoCard>
  )
}
