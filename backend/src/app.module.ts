import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { BullModule } from '@nestjs/bullmq'
import { LoggerMiddleware } from './middleware/logger.middleware'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { AllExceptionFilter } from './middleware/exception.filter'
import { S3Module } from './modules/s3/s3.module'
import { VideoModule } from './modules/video/video.module'
import { ImageModule } from './modules/image/image.module'
import { PostModule } from './modules/post/post.module'
import { ScheduleModule } from '@nestjs/schedule'
import { SchedulerModule } from './modules/scheduler/scheduler.module'
import { PostScheduleModule } from './modules/post-schedule/post-schedule.module'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { SongModule } from './modules/song/song.module'
import { StripeModule } from './modules/stripe/stripe.module'
import { SubscriptionModule } from './modules/subscription/subscription.module'
import { RedemptionCodeModule } from './modules/redemption-code/redemption-code.module'
import { XModule } from './modules/x/x.module'
import { RedisModule } from './modules/redis/redis.module'
import { RateLimitModule } from './modules/rate-limit/rate-limit.module'
import { ThrottlerModule } from '@nestjs/throttler'
import { RateLimitGuard } from './modules/rate-limit/rate-limit.guard'
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        // host: 'localhost',
        // port: 6379,
        url: process.env.REDIS_URL
      }
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60_000,
          limit: 1000
        }
      ]
    }),
    ScheduleModule.forRoot(),
    RedisModule,
    SchedulerModule,
    S3Module,
    VideoModule,
    ImageModule,
    PostModule,
    PostScheduleModule,
    UserModule,
    AuthModule,
    SongModule,
    StripeModule,
    SubscriptionModule,
    RedemptionCodeModule,
    XModule,
    RateLimitModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard
    },
    AppService
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL
    })
  }
}
