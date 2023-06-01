import { useEffect, useMemo } from 'react'
import { t } from '@lingui/macro'

import SidebarModal, { ModalContent } from 'src/components/Modal/Sidebar'
import { useModalOpened, useWalletModalToggle } from 'src/state/application/hooks'
import { ApplicationModal } from 'src/state/application/actions'
import { useSetWalletModalMode, useWalletModalMode } from 'src/state/wallet/hooks'
import { WalletModalMode } from 'src/state/wallet/actions'
import { ModalContents } from 'src/types'
import { ModalHeader } from '../Modal'
import Overview from './Overview'
import Deposit from './Deposit'
import StarkgateDeposit from './StarkgateDeposit'
import StarkgateWithdraw from './StarkgateWithdraw'
import Deploy from './Deploy'

function useModalContent(): ModalContents<WalletModalMode> {
  return useMemo(
    () => ({
      [WalletModalMode.OVERVIEW]: {
        Component: Overview,
        title: t`Wallet`,
      },
      [WalletModalMode.DEPLOY]: {
        Component: Deploy,
        title: t`Wallet`,
        previous: WalletModalMode.OVERVIEW,
      },
      [WalletModalMode.DEPOSIT]: {
        Component: Deposit,
        title: t`Add funds`,
        previous: WalletModalMode.OVERVIEW,
      },
      [WalletModalMode.STARKGATE_DEPOSIT]: {
        Component: StarkgateDeposit,
        title: t`Add funds`,
        previous: WalletModalMode.DEPOSIT,
      },
      [WalletModalMode.STARKGATE_WITHDRAW]: {
        Component: StarkgateWithdraw,
        title: t`Withdraw`,
        previous: WalletModalMode.OVERVIEW,
      },
    }),
    []
  )
}

// TODO: make a generic component for moded modals
export default function WalletModal() {
  // modal
  const isOpen = useModalOpened(ApplicationModal.WALLET)
  const toggleWalletModal = useWalletModalToggle()

  // modal mode
  const walletModalMode = useWalletModalMode()
  const setWalletModalMode = useSetWalletModalMode()

  // modal content
  const modalContent = useModalContent()

  const renderedModalContent = useMemo(() => {
    if (walletModalMode === null) return null
    const ModalContent = modalContent[walletModalMode]

    const onBack =
      ModalContent.previous !== undefined
        ? () => {
            if (ModalContent.previous !== undefined) setWalletModalMode(ModalContent.previous)
          }
        : undefined

    return (
      <>
        <ModalHeader onDismiss={toggleWalletModal} onBack={onBack} title={ModalContent.title} />
        <ModalContent.Component />
      </>
    )
  }, [walletModalMode, toggleWalletModal, setWalletModalMode])

  useEffect(() => {
    if (isOpen) {
      setWalletModalMode(WalletModalMode.OVERVIEW)
    }
  }, [isOpen])

  return (
    <SidebarModal onDismiss={toggleWalletModal} isOpen={isOpen} width={350} fullscreen>
      <ModalContent>{renderedModalContent}</ModalContent>
    </SidebarModal>
  )
}
