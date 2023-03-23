import React, { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { Call, Signature } from 'starknet'
import { t } from '@lingui/macro'

import { ModalBody } from '@/components/Modal/Classic'
import { useWaitingTransactionQuery } from '@/state/wallet/hooks'
import Confirmation from './Confirmation'
import Signer from './Signer'
import { PaginationSpinner } from '../Spinner'

const DummyFocusInput = styled.input`
  max-height: 0;
  max-width: 0;
  position: fixed;
  left: 99999px;
`

interface StarknetSignerProps {
  children: React.ReactNode
  confirmationText: string
  confirmationActionText?: string
  transactionText: string
  transactionValue?: string
  calls?: Call[]
  txHash?: string
  error?: string
  onSignature(signature: Signature, maxFee: string, nonce: string): void
  onError(error: string): void
}

export default function StarknetSigner({
  confirmationText,
  confirmationActionText,
  transactionText,
  transactionValue,
  calls,
  txHash,
  error,
  onSignature,
  onError,
  children,
}: StarknetSignerProps) {
  // wallet lazyness
  const waitingTransactionQuery = useWaitingTransactionQuery()
  const waitingTransaction = waitingTransactionQuery.data?.waitingTransaction

  useEffect(() => {
    if (waitingTransactionQuery.error) onError('An error has occurred, please refresh the page and try again.')
  }, [waitingTransactionQuery.error])

  // fee estimation waiting
  const [waitingForFees, setWaitingForFees] = useState(false)
  const onWaitingForFees = useCallback((waiting: boolean) => setWaitingForFees(waiting), [])

  // transaction waiting
  const [waitingForTx, setWaitingForTx] = useState(false)
  const onConfirmation = useCallback(() => setWaitingForTx(true), [])

  const isLoading = waitingTransactionQuery.loading

  return (
    <ModalBody>
      <DummyFocusInput type="text" />

      {!!waitingTransaction && (
        <Confirmation
          txHash={waitingTransaction.hash}
          confirmationText={t`Your wallet is already processing another transaction`}
        />
      )}

      {txHash || waitingForTx || waitingForFees ? (
        <Confirmation
          txHash={txHash ?? undefined}
          error={error ?? undefined}
          waitingForFees={waitingForFees}
          confirmationText={confirmationText}
          transactionText={transactionText}
          success={!!txHash}
        />
      ) : (
        !calls && !isLoading && children
      )}

      <PaginationSpinner loading={isLoading} />

      <Signer
        confirmationActionText={confirmationActionText}
        isOpen={!txHash && !waitingForTx && !waitingForFees && !!calls}
        transactionValue={transactionValue}
        onWaitingForFees={onWaitingForFees}
        onConfirmation={onConfirmation}
        onSignature={onSignature}
        onError={onError}
        calls={calls ?? undefined}
      />
    </ModalBody>
  )
}
