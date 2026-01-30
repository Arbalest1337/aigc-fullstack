'use client'
import { useState } from 'react'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react'
import { Refresh, Trash } from 'iconsax-reactjs'
import { useConfirmStore } from '@/store/useConfirmStore'

export default function VideoActions({ task, onDeleted, onRegenerated, className }) {
  const status = task.detail.output.task_status
  const isPending = ['PENDING', 'RUNNING'].includes(status)
  const isSuccess = ['SUCCEEDED'].includes(status)

  const [isOpen, setIsOpen] = useState(false)
  const onAction = key => {
    if (key === 'regenerate') onRegenerate?.()
    if (key === 'delete') onDelete?.()
  }

  const confirm = useConfirmStore(s => s.confirm)
  const onDelete = () => {
    confirm({
      title: `彻底删除${task.taskId}？`,
      content: '该操作无法恢复，确定要继续吗？',
      danger: true,
      onConfirm: async () => {
        await new Promise(resolve => setTimeout(resolve, 2000))
        onDeleted?.()
      }
    })
  }

  const onRegenerate = () => {}
  if (isPending) return null
  return (
    <Dropdown onOpenChange={setIsOpen}>
      <DropdownTrigger>
        <Button
          radius="full"
          isIconOnly
          size="sm"
          className={`text-[18px] absolute right-2 top-1 font-bold ${className ?? ''} ${
            isOpen && '!block'
          }`}
        >
          ···
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions" className="min-w-[150px]" onAction={onAction}>
        {isSuccess && (
          <DropdownItem key="regenerate" startContent={<Refresh size="16" />}>
            Regenerate
          </DropdownItem>
        )}
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={<Trash size="16" />}
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
