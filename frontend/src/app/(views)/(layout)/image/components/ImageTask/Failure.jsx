'use client'
import { Button, Card, CardBody } from '@heroui/react'
import { Danger, Trash } from 'iconsax-reactjs'

export default function GenerationError({ aspectRatio }) {
  return (
    <Card
      shadow="sm"
      className="bg-default-50 rounded-xl border-1 border-default-200 w-full flex items-center justify-center overflow-hidden"
      style={{ aspectRatio: aspectRatio }}
    >
      <CardBody className="flex flex-col items-center justify-center gap-4 p-4">
        <div className="w-14 h-14 rounded-full bg-default-200/50 flex items-center justify-center">
          <Danger size="28" className="text-danger-500" variant="Bold" />
        </div>

        <div className="text-center space-y-2">
          <h4 className="text-sm font-bold text-danger-500 tracking-tight"> FAILED</h4>
        </div>
      </CardBody>
    </Card>
  )
}
