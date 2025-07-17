import { Inject, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserDto } from 'src/users/domain/dtos/user.dto';
import { UserPublisherPort } from 'src/users/domain/messaging/user.publisher';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class UserRabbitMqPublisher implements UserPublisherPort {
    private client: ClientProxy;
    private readonly logger = new Logger(UserRabbitMqPublisher.name)
    constructor() {
        this.client = ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
                urls: [process.env.RABBITMQ_URL!],
                queue: process.env.RABBITMQ_QUEUE!,
                exchange: process.env.RABBITMQ_EXCHANGE!,
                exchangeType: process.env.RABBITMQ_EXCHANGE_TYPE!,
                routingKey: process.env.RABBITMQ_ROUTING_KEY!,
                queueOptions: {
                    durable: true  
                },
            },
        });
    }

    sendWelcomeEmail(data: UserDto): Observable<void> {
        try {
            this.logger.log('[INFO] Sending welcome email for user:', data);
            return this.client.emit('email.weelcome', data);
        } catch (error) {
            this.logger.error('Error to send message', error);
            throw error;
        }
    }
}