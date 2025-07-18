import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { firstValueFrom, of } from 'rxjs';
import { UserEntity } from '../../domain/entities/user.entity';
import { HttpCustomErrors } from '../../interface/exceptions/http.custom.error.erros';
import { MongoUserRepository } from './mongo.users.repository';

describe('UserRepository', () => {
    let userRepository: MongoUserRepository;
    let userModel: jest.Mocked<Model<UserEntity>>;

    const mockUser = {
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
            save: jest.fn().mockResolvedValue(mockUser),
            toObject: jest.fn().mockReturnValue(mockUser),
            firstName: mockUser.firstName,
        }));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MongoUserRepository,
                {
                    provide: getModelToken(UserEntity.name),
                    useValue: Object.assign(mockModelConstructor, {
                        findOne: jest.fn().mockReturnValue({
                            lean: jest.fn().mockReturnValue({
                                exec: jest.fn().mockResolvedValue(mockUser),
                            }),
                        }),
                    }),
                },
            ],
        }).compile();

        userRepository = module.get<MongoUserRepository>(MongoUserRepository);
        userModel = module.get(getModelToken(UserEntity.name));
    });

    it('should be defined', () => {
        expect(userRepository).toBeDefined();
    });

    describe('saveUser', () => {
        it('should save and return a user', async () => {
            const result$ = userRepository.saveUser(mockUser as any);

            const result = await firstValueFrom(result$);

            expect(result).toEqual(mockUser);
            expect(userModel).toBeDefined();
        });
    });

    describe('getUserByCpf', () => {
        it('should return a user by CPF', async () => {
            const result$ = userRepository.getUserByCpf(mockUser.cpf);

            const result = await firstValueFrom(result$);

            expect(result).toEqual(mockUser);
            expect(userModel.findOne).toHaveBeenCalledWith({ cpf: mockUser.cpf, isActive: true });
        });
    });



    it('should soft delete user when found', (done) => {
        jest.spyOn(userRepository, 'getUserByCpf').mockReturnValueOnce(of(mockUser));

        userModel.updateOne = jest.fn(() => ({
            exec: jest.fn().mockResolvedValueOnce({})
        })) as any;

        userRepository.deleteUserByCpf(mockUser.cpf).subscribe({
            next: (result) => {
                expect(userRepository.getUserByCpf).toHaveBeenCalledWith(mockUser.cpf);
                expect(userModel.updateOne).toHaveBeenCalledWith(
                    { cpf: mockUser.cpf },
                    { $set: { isActive: false } }
                );
                expect(result).toBeUndefined();
                done();
            },
            error: done,
        });
    });

    it('should throw NOT_FOUND error if user not found', (done) => {
        jest.spyOn(userRepository, 'getUserByCpf').mockReturnValueOnce(of(null));

        userRepository.deleteUserByCpf(mockUser.cpf).subscribe({
            next: () => done('Expected error, but got success'),
            error: (err) => {
                expect(err).toBeInstanceOf(HttpCustomErrors);
                expect(err.message).toContain('User not found for deletion');
                expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
                done();
            },
        });
    });


    it('should throw BAD_REQUEST if updateOne fails', (done) => {
        userRepository.getUserByCpf = jest.fn(() => of(mockUser));

        userModel.updateOne = jest.fn(() => ({
            exec: jest.fn().mockRejectedValueOnce(new Error('Mongo error'))
        })) as any;

        userRepository.deleteUserByCpf(mockUser.cpf).subscribe({
            next: () => done('Expected error, but got success'),
            error: (err) => {
                expect(err).toBeInstanceOf(HttpCustomErrors);
                expect(err.message).toContain('Error when try to delete user');
                expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
                done();
            },
        });
    });
    describe('updateUser', () => {
        it('should update and return the updated user', (done) => {
            const updatedUser = { ...mockUser, firstName: 'Updated' };

            userModel.findOneAndUpdate = jest.fn(() => ({
                lean: jest.fn(() => ({
                    exec: jest.fn().mockResolvedValueOnce(updatedUser)
                }))
            })) as any;

            userRepository.updateUser(updatedUser as any).subscribe({
                next: (result) => {
                    expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
                        { cpf: updatedUser.cpf },
                        { $set: { ...updatedUser } },
                        { new: true }
                    );
                    expect(result).toEqual(updatedUser);
                    done();
                },
                error: done,
            });
        });

        it('should throw NOT_FOUND error if user does not exist', (done) => {
            // Simula que `getUserByCpf` retorna null
            jest.spyOn(userRepository, 'getUserByCpf').mockReturnValueOnce(of(null));

            userRepository.updateUser(mockUser as any).subscribe({
                next: () => done('Expected error, but got success'),
                error: (err) => {
                    expect(err).toBeInstanceOf(HttpCustomErrors);
                    expect(err.message).toContain('User not found for update');
                    expect(err.getStatus()).toBe(HttpStatus.NOT_FOUND);
                    done();
                }
            });
        });

        it('should throw BAD_REQUEST if updatedUser is null', (done) => {
            jest.spyOn(userRepository, 'getUserByCpf').mockReturnValueOnce(of(mockUser));

            userModel.findOneAndUpdate = jest.fn(() => ({
                lean: jest.fn(() => ({
                    exec: jest.fn().mockResolvedValueOnce(null)
                }))
            })) as any;

            userRepository.updateUser(mockUser as any).subscribe({
                next: () => done('Expected error, but got success'),
                error: (err) => {
                    expect(err).toBeInstanceOf(HttpCustomErrors);
                    expect(err.message).toContain('Failed to update user');
                    expect(err.getStatus()).toBe(HttpStatus.BAD_REQUEST);
                    done();
                }
            });
        });

        it('should throw INTERNAL_SERVER_ERROR on unexpected error', (done) => {
            jest.spyOn(userRepository, 'getUserByCpf').mockReturnValueOnce(of(mockUser));

            userModel.findOneAndUpdate = jest.fn(() => ({
                lean: jest.fn(() => ({
                    exec: jest.fn().mockRejectedValueOnce(new Error('Unexpected Mongo error'))
                }))
            })) as any;

            userRepository.updateUser(mockUser as any).subscribe({
                next: () => done('Expected error, but got success'),
                error: (err) => {
                    expect(err).toBeInstanceOf(HttpCustomErrors);
                    expect(err.message).toContain('Unexpected error updating user');
                    expect(err.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
                    done();
                }
            });
        });
    });

});
