import { useCallback, useState, useEffect } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import Modal, { ModalHeader } from '@/components/Modal'
import { useModalOpen, useDepositModalToggle } from '@/state/application/hooks'
import { ApplicationModal } from '@/state/application/actions'
import Column from '@/components/Column'
import Deposit from './Deposit'
import Confirmation from './Confirmation'

const StyledDepositModal = styled(Column)`
  width: 546px;
  padding: 26px;
  background: ${({ theme }) => theme.bg2};
  border-radius: 4px;

  ${({ theme }) => theme.media.medium`
    width: 100%;
    height: 100%;
  `}
`

export default function PackPurchaseModal() {
  // modal
  const isOpen = useModalOpen(ApplicationModal.DEPOSIT)
  const toggleDepositModal = useDepositModalToggle()

  // deposit
  const [amountDeposited, setAmountDeposited] = useState<string | null>(null)
  const onDeposit = useCallback((amount: string) => setAmountDeposited(amount), [])

  // confirmation
  const [txHash, setTxHash] = useState<string | null>(null)
  const onConfirmation = useCallback((hash: string) => setTxHash(hash), [])

  // error
  const [error, setError] = useState<string | null>(null)
  const onError = useCallback((error: string) => setError(error), [])

  // on close modal
  useEffect(() => {
    if (isOpen) {
      setAmountDeposited(null)
      setError(null)
      setTxHash(null)
    }
  }, [isOpen])

  return (
    <Modal onDismiss={toggleDepositModal} isOpen={isOpen}>
      <StyledDepositModal gap={26}>
        <ModalHeader onDismiss={toggleDepositModal}>{amountDeposited ? <div /> : t`Fund your account`}</ModalHeader>
        {amountDeposited ? (
          <Confirmation
            amountDeposited={amountDeposited ?? undefined}
            txHash={txHash ?? undefined}
            error={error ?? undefined}
          />
        ) : (
          <Deposit onDeposit={onDeposit} onError={onError} onConfirmation={onConfirmation} />
        )}
      </StyledDepositModal>
    </Modal>
  )
}
