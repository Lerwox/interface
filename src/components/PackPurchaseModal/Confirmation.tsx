import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'

import Column, { ColumnCenter } from 'src/components/Column'
import { TYPE } from 'src/styles/theme'
import { PrimaryButton } from 'src/components/Button'
import Link from 'src/components/Link'
import Spinner from 'src/components/Spinner'
import useCurrentUser from 'src/hooks/useCurrentUser'

import { ReactComponent as Checkmark } from 'src/images/checkmark.svg'
import { ReactComponent as Close } from 'src/images/close.svg'

const StyledConfirmation = styled(ColumnCenter)`
  padding-bottom: 8px;
  gap: 32px;
`

const StyledCheckmark = styled(Checkmark)`
  border-radius: 50%;
  overflow: visible;
  background: ${({ theme }) => theme.primary1};
  width: 108px;
  height: 108px;
  padding: 24px;
  margin: 0 auto;
  stroke: ${({ theme }) => theme.text1};
`

const StyledFail = styled(Close)`
  border-radius: 50%;
  overflow: visible;
  background: ${({ theme }) => theme.error};
  width: 108px;
  height: 108px;
  padding: 24px;
  margin: 0 auto;
  stroke: ${({ theme }) => theme.text1};
`

const StyledSpinner = styled(Spinner)`
  margin: 0 auto;
`

const Title = styled(TYPE.large)`
  text-align: center;
  width: 100%;
`

const Subtitle = styled(TYPE.body)`
  text-align: center;
  width: 100%;
  max-width: 420px;
`

const ErrorMessage = styled(Subtitle)`
  text-align: center;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.error};
`

const SeeMyPacksButtonWrapper = styled(ColumnCenter)`
  width: 100%;

  a {
    max-width: 380px;
    width: 100%;
  }

  button {
    width: 100%;
  }
`

interface ConfirmationProps {
  packName: string
  error?: string
  success?: boolean
}

export default function Confirmation({ packName, error, success = false }: ConfirmationProps) {
  const { currentUser } = useCurrentUser()

  if (!currentUser) return null

  return (
    <StyledConfirmation>
      <Column gap={24}>
        {success ? <StyledCheckmark /> : error ? <StyledFail /> : <StyledSpinner fill="primary1" />}

        {success ? (
          <ColumnCenter gap={8}>
            <Title>
              <Trans>Your {packName} is on its way</Trans>
            </Title>

            <Subtitle>
              <Trans>
                Thank you, your payment has been successful.
                <br />A confirmation email has been sent to&nbsp;
                <span style={{ fontWeight: 700 }}>{currentUser.email}</span>
              </Trans>
            </Subtitle>
          </ColumnCenter>
        ) : error ? (
          <ColumnCenter gap={8}>
            <Title>
              <Trans>Your payment failed for the following reason:</Trans>
            </Title>

            <ErrorMessage>{error}</ErrorMessage>
          </ColumnCenter>
        ) : (
          <ColumnCenter gap={8}>
            <Title>
              <Trans>Payment being processed</Trans>
            </Title>
          </ColumnCenter>
        )}
      </Column>

      {success && (
        <SeeMyPacksButtonWrapper>
          <Link href={`/user/${currentUser.slug}/packs`}>
            <PrimaryButton large>
              <Trans>See my packs</Trans>
            </PrimaryButton>
          </Link>
        </SeeMyPacksButtonWrapper>
      )}
    </StyledConfirmation>
  )
}
