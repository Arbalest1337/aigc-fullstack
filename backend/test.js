import pkg from '@fal-ai/client'
const { fal, FalClient } = pkg

const model = 'fal-ai/nano-banana'
const taskId = `162b8754-cd39-4180-a365-fcd04558dc4f`

const checkStatus = async () => {
  const status = await fal.queue.status(model, { requestId: taskId })
  console.log(status)
  return status
}

checkStatus()
