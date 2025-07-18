import { Test, TestingModule } from '@nestjs/testing';
import { TentantController } from './tentant.controller';
import { Types } from 'mongoose';
import { TentantUseCase } from '../../application/use-case/tentat.use-case';
import { TentantDto } from '../../application/dtos/tentant.dto';

describe('TentantController', () => {
    let tentantController: TentantController;
    let tentantUseCase: TentantUseCase;

    const mockTentantDto: TentantDto = {
        _id: new Types.ObjectId(),
        __v: 0,
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@example.com',
        age: 27,
        bornDate: new Date('1998-04-20'),
        isActive: true,
        cpf: '12345678900',
    };
    const mockTentantUseCase = {
        createTentant: jest.fn().mockResolvedValue(mockTentantDto),
        getTentant: jest.fn().mockResolvedValue(mockTentantDto),
        deleteTentant: jest.fn().mockResolvedValue(mockTentantDto),
        updateTentant: jest.fn().mockResolvedValue(mockTentantDto),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TentantController],
            providers: [
                {
                    provide: TentantUseCase,
                    useValue: mockTentantUseCase,
                },
            ],
        }).compile();

        tentantController = module.get<TentantController>(TentantController);
        tentantUseCase = module.get<TentantUseCase>(TentantUseCase);
    });

    it('should be defined', () => {
        expect(tentantController).toBeDefined();
    });

    describe('createTentant', () => {
        it('should call tentantUseCase.createTentant and return the created tentant', async () => {
            const result = await tentantController.createTentant(mockTentantDto);

            expect(tentantUseCase.createTentant).toHaveBeenCalledWith(mockTentantDto);
            expect(result).toEqual(mockTentantDto);
        });
    });

    describe('getTentant', () => {
        it('should call tentantUseCase.getTentant with CPF and return the tentant', async () => {
            const cpf = '12345678900';
            const result = await tentantController.getTentant(cpf);

            expect(tentantUseCase.getTentant).toHaveBeenCalledWith(cpf);
            expect(result).toEqual(mockTentantDto);
        });
    });

    describe('deleteTentant', () => {
        it('should call tentantUseCase.deleteTentant with CPF', async () => {
            const cpf = '12345678900';
            await tentantController.deleteTentant(cpf);

            expect(tentantUseCase.deleteTentant).toHaveBeenCalledWith(cpf);
        });
    });


    describe('updateTentant', () => {

        it('should call tentantUseCase.updateTentant and return the updated tentant', async () => {
            const result = await tentantController.updateTentant(mockTentantDto);

            expect(tentantUseCase.updateTentant).toHaveBeenCalledWith(mockTentantDto);
            expect(result).toEqual(mockTentantDto);
        });
    });
});
