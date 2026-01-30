import { Injectable } from '@nestjs/common'

import { WorkerHost, Processor, OnWorkerEvent } from '@nestjs/bullmq'
import { Job, UnrecoverableError } from 'bullmq'

interface TestJobData {
  inputData: string
  shouldFail?: boolean
  permanentlyFail?: boolean
  Fail?: boolean
  reason?: string
}

interface TestJobResult {
  processedId: string
}

@Injectable()
@Processor('testQueue', { concurrency: 10, autorun: false, drainDelay: 15 })
export class QueueProcessor extends WorkerHost {
  async process(job: Job<TestJobData, TestJobResult, string>) {
    // process
    await job.updateProgress(50)

    // failed
    if (job.data.permanentlyFail) {
      throw new UnrecoverableError(
        `彻底失败且不会重试，立即达到最大尝试数: ${job.data.reason || '彻底测试失败'}`
      )
    }

    if (job.data.shouldFail) {
      throw new Error(`故意失败且会尝试重试: ${job.data.reason || '测试失败'}`)
    }

    // completed
    const resultData = { processedId: `proc-${job.id}` }
    return resultData
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job, result: TestJobResult) {
    console.log(`✅ [${job.id}] 任务完成! Worker 返回值:`, result)
  }

  @OnWorkerEvent('progress')
  onProgress(job: Job, progress: any) {
    console.log(`⏳ [${job.id}] 进度更新: ${progress}`)
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    const maxAttempts = job.opts.attempts ?? 1
    if (job.attemptsMade < maxAttempts) {
      console.warn(
        `[暂时失败] 任务 ${job.id} 尝试 ${job.attemptsMade}/${maxAttempts} 失败，等待重试。`
      )
      return
    }
    console.error(`❌ [最终失败] 任务 ${job.id} 耗尽所有 ${maxAttempts} 次重试机会: ${err.message}`)
  }

  @OnWorkerEvent('error')
  onError(err: Error) {
    console.error(`🚨🚨 [基础设施错误] Worker Redis 连接断开或其他问题: ${err.message}`)
    // 可选：对于无法恢复的连接错误，强制 Worker 进程退出，依靠外部系统重启。
    // process.exit(1);
  }

  //   @OnWorkerEvent('lockRenewalFailed')
  //   onLockRenewalFailed(jobIds: string[]) {
  //     console.error(`🔒 锁续约失败，受影响 jobIds: ${jobIds.join(', ')}`)
  //   }
}
