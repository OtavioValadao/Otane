import { Test, TestingModule } from '@nestjs/testing';
import { TentantRabbitMqPublisher } from './tentant.rabbitMq.publisher';
import { ClientProxy } from '@nestjs/microservices';
import { TentantDto } from '../../application/dtos/tentant.dto';
import { of } from 'rxjs';

describe('TentantRabbitMqPublisher', () => {
  let publisher: TentantRabbitMqPublisher;

  const mockEmit = jest.fn();

  const mockClientProxy = {
    emit: mockEmit,
  } as unknown as ClientProxy;

  const mockTentantDto: TentantDto = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    age: 30,
    bornDate: new Date('1993-10-10'),
    cpf: '12345678900',
    _id: {} as any,
    __v: 0,
    isActive: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TentantRabbitMqPublisher],
    }).compile();

    publisher = module.get<TentantRabbitMqPublisher>(TentantRabbitMqPublisher);

    // Substitui o client real pelo mock
    (publisher as any).client = mockClientProxy;
  });

  describe('sendWeelcomeEmail', () => {
    it('should emit welcome email event', () => {
      mockEmit.mockReturnValue(of(undefined));

      const result$ = publisher.sendWeelcomeEmail(mockTentantDto);

      expect(mockEmit).toHaveBeenCalledWith('email.weelcome', mockTentantDto);
      expect(result$).toBeDefined();
    });

    it('should log and throw if emit fails', () => {
      const error = new Error('Emit failed');
      mockEmit.mockImplementation(() => {
        throw error;
      });

      expect(() => publisher.sendWeelcomeEmail(mockTentantDto)).toThrow(error);
      expect(mockEmit).toHaveBeenCalledWith('email.weelcome', mockTentantDto);
    });
  });
});
