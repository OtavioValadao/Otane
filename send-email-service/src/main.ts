import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL!],
      queue: process.env.RABBITMQ_QUEUE!,
      queueOptions: {
        durable: true,
      },
      exchange: process.env.RABBITMQ_EXCHANGE!,
      exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE!,
      noAck: false
    },
  });
  await app.listen();
}
bootstrap();
