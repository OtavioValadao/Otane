import { Module } from '@nestjs/common';
import { EmailListenerController } from './controller/user.handle';


@Module({
  imports: [],
  controllers: [EmailListenerController],
  providers: [],
})
export class AppModule {}
