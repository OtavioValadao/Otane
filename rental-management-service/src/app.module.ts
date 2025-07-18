import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TentantModule } from './tentant/tentant.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!),
    TentantModule,
  ]
})
export class AppModule { }