import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './interception/response.interception'
import { HttpStatus } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true })
  app.use((req, res, next) => {
    if (req.path.startsWith('/.well-known/')) return res.status(HttpStatus.NOT_FOUND).end()
    next()
  })
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.enableCors({ origin: '*' })
  app.set('trust proxy', true)

  const config = new DocumentBuilder()
    .setTitle('AI Backend API')
    .setDescription('')
    .setVersion('1.0')
    .addTag('AI')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, documentFactory)

  await app.listen(process.env.PORT ?? 4000)
}
bootstrap()
