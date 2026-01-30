'use client'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'
import { useConfirmStore } from '@/store/useConfirmStore'

export default function GlobalConfirmModal() {
  const { isOpen, config, close, isLoading, setLoading } = useConfirmStore()

  const handleConfirm = async () => {
    if (!config?.onConfirm) return

    try {
      setLoading(true)
      await config.onConfirm() // 支持异步逻辑
      close()
    } catch (error) {
      console.error('操作失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={close} size="sm">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{config?.title || '确认操作'}</ModalHeader>
        <ModalBody>
          <p>{config?.content}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={close} isDisabled={isLoading}>
            取消
          </Button>
          <Button
            color={config?.danger ? 'danger' : 'primary'}
            onPress={handleConfirm}
            isLoading={isLoading}
          >
            确定
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
