import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TentantUseCase } from './application/use-case/tentat.use-case';
import { TenantEntity, UserSchema } from './domain/entities/tenant.entity';
import { TentantRabbitMqPublisher } from './infra/messaging/tentant.rabbitMq.publisher';
import { MongoTentantRepository } from './infra/repositories/mongo.tentant.repository';
import { TentantController } from './interface/controllers/tentant.controller';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: TenantEntity.name, schema: UserSchema },
        ]),
    ],
    controllers: [TentantController],
    providers: [
        TentantUseCase,
        MongoTentantRepository,
        TentantRabbitMqPublisher
    ]
})
export class TentantModule { }
