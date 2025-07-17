import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class EmailListenerController {
  private readonly logger = new Logger(EmailListenerController.name);

  @EventPattern('email.weelcome') 
  async handleWelcomeEmail(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Mensagem recebida: ${JSON.stringify(data)}`);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);
  }
}
