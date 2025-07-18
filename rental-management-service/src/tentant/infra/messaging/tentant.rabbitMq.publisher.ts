import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { TentantPublisherPort } from 'src/tentant/domain/messaging/tentant.publisher';
import { TentantDto } from '../../application/dtos/tentant.dto';

@Injectable()
export class TentantRabbitMqPublisher implements TentantPublisherPort {
    private client: ClientProxy;
    private readonly logger = new Logger(TentantRabbitMqPublisher.name)
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

    sendWeelcomeEmail(data: TentantDto): Observable<void> {
        try {
            this.logger.log('[INFO] Sending weelcome email for tentant:', data);
            return this.client.emit('email.weelcome', data);
        } catch (error) {
            this.logger.error('Error to send message', error);
            throw error;
        }
    }
}