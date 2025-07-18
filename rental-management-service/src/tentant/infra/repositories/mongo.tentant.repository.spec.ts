import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { firstValueFrom, of } from 'rxjs';
import { TenantEntity } from '../../domain/entities/tenant.entity';
import { HttpCustomErrors } from '../../interface/exceptions/http.custom.error.erros';
import { MongoTentantRepository } from './mongo.tentant.repository';

describe('TentantRepository', () => {
    let tentantRepository: MongoTentantRepository;
    let tentantModel: jest.Mocked<Model<TenantEntity>>;

    const mockTentant = {
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'email@example.com',
        age: 30,
        bornDate: new Date('1993-10-10'),
        cpf: '12345678900',
        isActive: true,
        toObject: jest.fn().mockImplementation(function () {
            return this;
        }),
    };

    beforeEach(async () => {
        const mockModelConstructor = jest.fn(() => ({
            save: jest.fn().mockResolvedValue(mockTentant),
            toObject: jest.fn().mockReturnValue(mockTentant),
            firstName: mockTentant.firstName,
        }));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MongoTentantRepository,
                {
                    provide: getModelToken(TenantEntity.name),
                    useValue: Object.assign(mockModelConstructor, {
                        findOne: jest.fn().mockReturnValue({
                            lean: jest.fn().mockReturnValue({
                                exec: jest.fn().mockResolvedValue(mockTentant),
                            }),
                        }),
                    }),
                },
            ],
        }).compile();

        tentantRepository = module.get<MongoTentantRepository>(MongoTentantRepository);
        tentantModel = module.get(getModelToken(TenantEntity.name));
    });

    it('should be defined', () => {
        expect(tentantRepository).toBeDefined();
    });

    describe('saveTentant', () => {
        it('should save and return a tentant', async () => {
            const result$ = tentantRepository.saveTentant(mockTentant as any);

            const result = await firstValueFrom(result$);

            expect(result).toEqual(mockTentant);
            expect(tentantModel).toBeDefined();
        });
    });

    describe('getTentantByCpf', () => {
        it('should return a tentant by CPF', async () => {
            const result$ = tentantRepository.getTentantByCpf(mockTentant.cpf);

            const result = await firstValueFrom(result$);

            expect(result).toEqual(mockTentant);
            expect(tentantModel.findOne).toHaveBeenCalledWith({ cpf: mockTentant.cpf, isActive: true });
        });
    });

    it('should soft delete tentant when found', (done) => {
        jest.spyOn(tentantRepository, 'getTentantByCpf').mockReturnValueOnce(of(mockTentant));

        tentantModel.updateOne = jest.fn(() => ({
            exec: jest.fn().mockResolvedValueOnce({})
        })) as any;

        tentantRepository.deleteTentantByCpf(mockTentant.cpf).subscribe({
            next: (result) => {
                expect(tentantRepository.getTentantByCpf).toHaveBeenCalledWith(mockTentant.cpf);
                expect(tentantModel.updateOne).toHaveBeenCalledWith(
                    { cpf: mockTentant.cpf },
                    { $set: { isActive: false } }
                );
                expect(result).toBeUndefined();
                done();
            },
            error: done,
        });
    });

    it('should throw NOT_FOUND error if tentant not found', (done) => {
        jest.spyOn(tentantRepository, 'getTentantByCpf').mockReturnValueOnce(of(null));

        tentantRepository.deleteTentantByCpf(mockTentant.cpf).subscribe({
            next: () => done('Expected error, but got success'),
            error: (err) => {
                expect(err).toBeInstanceOf(HttpCustomErrors);
                expect(err.message).toContain('Tentant not found for deletion');
                expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
                done();
            },
        });
    });

    it('should throw BAD_REQUEST if updateOne fails', (done) => {
        tentantRepository.getTentantByCpf = jest.fn(() => of(mockTentant));

        tentantModel.updateOne = jest.fn(() => ({
            exec: jest.fn().mockRejectedValueOnce(new Error('Mongo error'))
        })) as any;

        tentantRepository.deleteTentantByCpf(mockTentant.cpf).subscribe({
            next: () => done('Expected error, but got success'),
            error: (err) => {
                expect(err).toBeInstanceOf(HttpCustomErrors);
                expect(err.message).toContain("Error when trying to delete tentant: 12345678900");
                expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
                done();
            },
        });
    });

    describe('updateTentant', () => {
        it('should update and return the updated tentant', (done) => {
            const updatedTentant = { ...mockTentant, firstName: 'Updated' };

            tentantModel.findOneAndUpdate = jest.fn(() => ({
                lean: jest.fn(() => ({
                    exec: jest.fn().mockResolvedValueOnce(updatedTentant)
                }))
            })) as any;

            tentantRepository.updateTentant(updatedTentant as any).subscribe({
                next: (result) => {
                    expect(tentantModel.findOneAndUpdate).toHaveBeenCalledWith(
                        { cpf: updatedTentant.cpf },
                        { $set: { ...updatedTentant } },
                        { new: true }
                    );
                    expect(result).toEqual(updatedTentant);
                    done();
                },
                error: done,
            });
        });

        it('should throw NOT_FOUND error if tentant does not exist', (done) => {
            jest.spyOn(tentantRepository, 'getTentantByCpf').mockReturnValueOnce(of(null));

            tentantRepository.updateTentant(mockTentant as any).subscribe({
                next: () => done('Expected error, but got success'),
                error: (err) => {
                    expect(err).toBeInstanceOf(HttpCustomErrors);
                    expect(err.message).toContain('Tentant not found for update');
                    expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
                    done();
                }
            });
        });

        it('should throw BAD_REQUEST if updatedTentant is null', (done) => {
            jest.spyOn(tentantRepository, 'getTentantByCpf').mockReturnValueOnce(of(mockTentant));

            tentantModel.findOneAndUpdate = jest.fn(() => ({
                lean: jest.fn(() => ({
                    exec: jest.fn().mockResolvedValueOnce(null)
                }))
            })) as any;

            tentantRepository.updateTentant(mockTentant as any).subscribe({
                next: () => done('Expected error, but got success'),
                error: (err) => {
                    expect(err).toBeInstanceOf(HttpCustomErrors);
                    expect(err.message).toContain('Failed to update tentant');
                    expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
                    done();
                }
            });
        });

        it('should throw INTERNAL_SERVER_ERROR on unexpected error', (done) => {
            jest.spyOn(tentantRepository, 'getTentantByCpf').mockReturnValueOnce(of(mockTentant));

            tentantModel.findOneAndUpdate = jest.fn(() => ({
                lean: jest.fn(() => ({
                    exec: jest.fn().mockRejectedValueOnce(new Error('Unexpected Mongo error'))
                }))
            })) as any;

            tentantRepository.updateTentant(mockTentant as any).subscribe({
                next: () => done('Expected error, but got success'),
                error: (err) => {
                    expect(err).toBeInstanceOf(HttpCustomErrors);
                    expect(err.message).toContain('Unexpected error updating tentant');
                    expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
                    done();
                }
            });
        });
    });
});
