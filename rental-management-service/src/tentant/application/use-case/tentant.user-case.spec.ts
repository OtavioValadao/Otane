import { HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { firstValueFrom, Observable, of, throwError } from "rxjs";
import { TenantEntity } from "../../domain/entities/tenant.entity";
import { TentantRabbitMqPublisher } from "../../infra/messaging/tentant.rabbitMq.publisher";
import { MongoTentantRepository } from "../../infra/repositories/mongo.tentant.repository";
import { HttpCustomErrors } from "../../interface/exceptions/http.custom.error.erros";
import { TentantDto } from "../dtos/tentant.dto";
import { TentantUseCase } from "./tentat.use-case";

describe('TentantUseCase', () => {
    let tentantUseCase: TentantUseCase;

    let tentantRepository: {
        saveTentant: jest.Mock<Observable<TentantDto>, [TentantDto]>,
        getTentantByCpf: jest.Mock<Observable<TenantEntity | null>, string[]>,
        deleteTentantByCpf: jest.Mock<Observable<void>, [string]>,
        updateTentant: jest.Mock<Observable<TentantDto>, [TentantDto]>,
    };

    let tentantPublisher: {
        sendWeelcomeEmail: jest.Mock<Observable<void>, [TentantDto]>,
    };

    const mockTentantDto: TentantDto = {
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@example.com',
        age: 30,
        bornDate: new Date('1993-10-10'),
        cpf: '12345678900',
        _id: new Types.ObjectId(),
        __v: 0,
        isActive: true,
    };

    const mockTentantEntity: TenantEntity = {
        ...mockTentantDto,
        isActive: true,
    };

    let mockRepo: jest.Mocked<MongoTentantRepository>;

    beforeEach(async () => {
        tentantRepository = {
            saveTentant: jest.fn(),
            getTentantByCpf: jest.fn(),
            deleteTentantByCpf: jest.fn(),
            updateTentant: jest.fn(),
        };

        tentantPublisher = {
            sendWeelcomeEmail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TentantUseCase,
                {
                    provide: MongoTentantRepository,
                    useValue: tentantRepository,
                },
                {
                    provide: TentantRabbitMqPublisher,
                    useValue: tentantPublisher,
                },
            ],
        }).compile();

        tentantUseCase = module.get<TentantUseCase>(TentantUseCase);
    });

    describe('createTentant', () => {
        it('should create a tentant and return TentantDto', async () => {
            tentantRepository.saveTentant.mockReturnValueOnce(of(mockTentantDto));
            tentantPublisher.sendWeelcomeEmail.mockReturnValueOnce(of(undefined));

            const result$ = tentantUseCase.createTentant(mockTentantDto);
            const result = await firstValueFrom(result$);

            expect(tentantRepository.saveTentant).toHaveBeenCalledWith(mockTentantDto);

            expect(result).toMatchObject({
                firstName: mockTentantDto.firstName,
                email: mockTentantDto.email,
                cpf: mockTentantDto.cpf,
            });

            expect(tentantPublisher.sendWeelcomeEmail).toHaveBeenCalledWith(expect.objectContaining({
                cpf: mockTentantDto.cpf,
                email: mockTentantDto.email,
            }));
        });
    });

    describe('getTentant', () => {
        it('should return a tentant when found by CPF', async () => {
            tentantRepository.getTentantByCpf.mockReturnValueOnce(of(mockTentantEntity));

            const result$ = tentantUseCase.getTentant(mockTentantDto.cpf);
            const result = await firstValueFrom(result$);

            expect(tentantRepository.getTentantByCpf).toHaveBeenCalledWith(mockTentantDto.cpf);
            expect(result).not.toBeNull();
            expect(result.email).toBe(mockTentantDto.email);
        });

        it('should throw error if tentant is not found', async () => {
            tentantRepository.getTentantByCpf.mockReturnValueOnce(of(null));

            await expect(firstValueFrom(tentantUseCase.getTentant('00000000000'))).rejects.toThrow(
                new HttpCustomErrors('[ERROR] Tentant not found: 00000000000', HttpStatus.NOT_FOUND),
            );
        });
    });

    describe('deleteTentant', () => {
        it('should delete a tentant by CPF', async () => {
            tentantRepository.deleteTentantByCpf.mockReturnValueOnce(of(undefined));

            await tentantUseCase.deleteTentant(mockTentantDto.cpf);

            expect(tentantRepository.deleteTentantByCpf).toHaveBeenCalledWith(mockTentantDto.cpf);
        });

        it('should emit error from observable', (done) => {
            const error = new HttpCustomErrors('[ERROR]', 500);
            tentantRepository.deleteTentantByCpf.mockReturnValueOnce(throwError(() => error));

            tentantUseCase.deleteTentant(mockTentantDto.cpf).subscribe({
                next: () => done('Expected error, but got success'),
                error: (err) => {
                    expect(err).toBe(error);
                    done();
                }
            });
        });
    });

    describe('updateTentant', () => {
        it('should update a tentant and return updated dto', async () => {
            tentantRepository.updateTentant.mockReturnValueOnce(of(mockTentantDto));

            const result = await firstValueFrom(tentantUseCase.updateTentant(mockTentantDto));

            expect(tentantRepository.updateTentant).toHaveBeenCalledWith(mockTentantDto);
            expect(result).toMatchObject({
                firstName: mockTentantDto.firstName,
                lastName: mockTentantDto.lastName,
                email: mockTentantDto.email,
                cpf: mockTentantDto.cpf,
            });
        });

        it('should throw HttpCustomErrors if update fails', async () => {
            const error = new HttpCustomErrors('[ERROR] Failed to update tentant', HttpStatus.BAD_REQUEST);
            tentantRepository.updateTentant.mockReturnValueOnce(throwError(() => error));

            await expect(firstValueFrom(tentantUseCase.updateTentant(mockTentantDto))).rejects.toThrow(error);
            expect(tentantRepository.updateTentant).toHaveBeenCalledWith(mockTentantDto);
        });
    });
});
