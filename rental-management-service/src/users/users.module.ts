import { Module } from '@nestjs/common';
import { MongoUserRepository } from './infra/repositories/mongo.users.repository';
import { UserUseCase } from './use-case/user.use-case';
import { UserEntity, UserSchema } from './domain/entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './controllers/user.controller';
import { UserRabbitMqPublisher } from './infra/messaging/user.rabbitMq.publisher';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UserEntity.name, schema: UserSchema },
        ]),
    ],
    controllers: [UserController],
    providers: [
        UserUseCase,
        MongoUserRepository,
        UserRabbitMqPublisher
    ]
})
export class UsersModule { }
