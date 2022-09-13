import { useState, useCallback, useEffect } from 'react'
import styled from 'styled-components'
import { t, Trans } from '@lingui/macro'
import { uint256HexFromStrHex } from '@rulesorg/sdk-core'
import { ApolloError } from '@apollo/client'
import { Call, Signature } from 'starknet'

import Modal from '@/components/Modal'
import { useModalOpen, useCancelOfferModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import { useCurrentUser } from '@/state/user/hooks'
import Column from '@/components/Column'
import { RowCenter } from '@/components/Row'
import { TYPE } from '@/styles/theme'
import { PrimaryButton } from '@/components/Button'
import { ErrorCard } from '@/components/Card'
import LockedWallet from '@/components/LockedWallet'
import StarknetSigner from '@/components/StarknetSigner'
import { MARKETPLACE_ADDRESSES } from '@/constants/addresses'
import { useCancelOfferMutation } from '@/state/wallet/hooks'
import { networkId } from '@/constants/networks'

const CardBreakdown = styled(RowCenter)`
  gap: 16px;
  background: ${({ theme }) => theme.bg5};
  width: 100%;
  padding: 12px;

  & img {
    width: 64px;
    border-radius: 4px;
  }
`

interface CancelOfferModalProps {
  artistName: string
  season: number
  scarcityName: string
  scarcityMaxSupply?: number
  serialNumber: number
  pictureUrl: string
  tokenId: string
  onSuccess(): void
}

export default function CancelOfferModal({
  artistName,
  season,
  scarcityName,
  scarcityMaxSupply,
  serialNumber,
  tokenId,
  pictureUrl,
  onSuccess,
}: CancelOfferModalProps) {
  // current user
  const currentUser = useCurrentUser()

  // modal
  const isOpen = useModalOpen(ApplicationModal.CANCEL_OFFER)
  const toggleCancelOfferModal = useCancelOfferModalToggle()

  // call
  const [calls, setCalls] = useState<Call[] | null>(null)
  const handleConfirmation = useCallback(() => {
    const uint256TokenId = uint256HexFromStrHex(tokenId)

    setCalls([
      {
        contractAddress: MARKETPLACE_ADDRESSES[networkId],
        entrypoint: 'cancelOffer',
        calldata: [uint256TokenId.low, uint256TokenId.high],
      },
    ])
  }, [tokenId])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // signature
  const [cancelOfferMutation] = useCancelOfferMutation()
  const [txHash, setTxHash] = useState<string | null>(null)

  const onSignature = useCallback(
    (signature: Signature, maxFee: string) => {
      cancelOfferMutation({
        variables: { tokenId, maxFee, signature: JSON.stringify(signature) },
      })
        .then((res?: any) => {
          const hash = res?.data?.cancelOffer?.hash
          if (!hash) {
            onError('Transaction not received')
            return
          }

          setTxHash(hash)
          onSuccess()
        })
        .catch((cancelOfferError: ApolloError) => {
          const error = cancelOfferError?.graphQLErrors?.[0]
          onError(error?.message ?? 'Transaction not received')

          console.error(error)
        })
    },
    [tokenId, onSuccess]
  )

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setCalls(null)
      setTxHash(null)
      setError(null)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleCancelOfferModal} isOpen={isOpen}>
      <StarknetSigner
        modalHeaderText={t`Confirm offer cancelation`}
        confirmationText={t`Your offer will be canceled`}
        transactionText={t`offer cancelation.`}
        calls={calls ?? undefined}
        txHash={txHash ?? undefined}
        error={error ?? undefined}
        onDismiss={toggleCancelOfferModal}
        onSignature={onSignature}
        onError={onError}
      >
        <Column gap={32}>
          <CardBreakdown>
            <img src={pictureUrl} />
            <Column gap={4}>
              <TYPE.body spanColor="text2">
                {artistName} S{season}&nbsp;
                <Trans id={scarcityName} render={({ translation }) => <>{translation}</>} />
              </TYPE.body>
              <TYPE.subtitle>
                #{serialNumber} / {scarcityMaxSupply ?? '4000'}
              </TYPE.subtitle>
            </Column>
          </CardBreakdown>

          {currentUser?.starknetWallet.needsSignerPublicKeyUpdate && (
            <ErrorCard>
              <LockedWallet />
            </ErrorCard>
          )}

          <PrimaryButton onClick={handleConfirmation} large>
            <Trans>Next</Trans>
          </PrimaryButton>
        </Column>
      </StarknetSigner>
    </Modal>
  )
}
