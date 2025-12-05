import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './interception/response.interception'
import { HttpStatus } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true })
  app.use((req, res, next) => {
    if (req.path.startsWith('/.well-known/')) return res.status(HttpStatus.NOT_FOUND).end()
    next()
  })
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.enableCors({ origin: '*' })
  app.set('trust proxy', true)
  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
