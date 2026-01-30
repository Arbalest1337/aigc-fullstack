'use client'
import { Modal, ModalContent, ModalBody } from '@heroui/modal'
import { Spinner } from '@heroui/spinner'

export default function Loading({ isOpen }) {
  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      backdrop="blur"
      hideCloseButton={true}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      className="max-w-fit bg-transparent shadow-none"
    >
      <ModalContent>
        <ModalBody className="flex flex-col items-center justify-center p-8">
          <Spinner size="lg" color="primary" labelColor="primary" label="Loading..." />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
