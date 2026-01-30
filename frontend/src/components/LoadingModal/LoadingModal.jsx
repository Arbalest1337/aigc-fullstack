'use client'

import { Modal, ModalContent, Spinner } from '@heroui/react'

export default function LoadingModal({ isOpen, onOpenChange }) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="full"
      placement="center"
      backdrop="blur"
      hideCloseButton
      isDismissable={false}
      motionProps={{
        variants: {
          enter: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 }
        }
      }}
    >
      <ModalContent className="flex items-center justify-center bg-transparent">
        <Spinner size="lg" color="white" label="Loading..." labelColor="white" />
      </ModalContent>
    </Modal>
  )
}
