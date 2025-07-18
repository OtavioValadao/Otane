import { Test, TestingModule } from "@nestjs/testing";
import { UserUseCase } from "./user.use-case";
import { HttpStatus } from "@nestjs/common";
import { Types } from "mongoose";
import { firstValueFrom, Observable, of, throwError } from "rxjs";
import { UserDto } from "../dtos/user.dto";
import { UserEntity } from "../../domain/entities/user.entity";
import { MongoUserRepository } from "../../infra/repositories/mongo.users.repository";
import { HttpCustomErrors } from "../../interface/exceptions/http.custom.error.erros";
import { UserRabbitMqPublisher } from "../../infra/messaging/user.rabbitMq.publisher";

describe('UserUseCase', () => {
    let userUseCase: UserUseCase;

    let userRepository: {
        saveUser: jest.Mock<Observable<UserDto>, [UserDto]>,
        getUserByCpf: jest.Mock<Observable<UserEntity | null>, string[]>,
        deleteUserByCpf: jest.Mock<Observable<void>, [string]>,
        updateUser: jest.Mock<Observable<UserDto>, [UserDto]>,
    };

    let userPublisher: {
        sendWelcomeEmail: jest.Mock<Observable<void>, [UserDto]>,
    };

    const mockUserDto: UserDto = {
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

    const mockUserEntity: UserEntity = {
        ...mockUserDto,
        isActive: true,
    };


    let mockRepo: jest.Mocked<MongoUserRepository>;

    beforeEach(async () => {
        userRepository = {
            saveUser: jest.fn(),
            getUserByCpf: jest.fn(),
            deleteUserByCpf: jest.fn(),
            updateUser: jest.fn(),
        };

        userPublisher = {
            sendWelcomeEmail: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserUseCase,
                {
                    provide: MongoUserRepository,
                    useValue: userRepository,

                },
                {
                    provide: UserRabbitMqPublisher,
                    useValue: userPublisher,
                },
            ],
        }).compile();

        userUseCase = module.get<UserUseCase>(UserUseCase);

    });

    describe('createUser', () => {
        it('should create a user and return UserDto', async () => {
           
            userRepository.saveUser.mockReturnValueOnce(of(mockUserDto));

            userPublisher.sendWelcomeEmail.mockReturnValueOnce(of(undefined));

            const result$ = userUseCase.createUser(mockUserDto);

            const result = await firstValueFrom(result$);

            expect(userRepository.saveUser).toHaveBeenCalledWith(mockUserDto);

            expect(result).toMatchObject({
                firstName: mockUserDto.firstName,
                email: mockUserDto.email,
                cpf: mockUserDto.cpf,
            });

            expect(userPublisher.sendWelcomeEmail).toHaveBeenCalledWith(expect.objectContaining({
                cpf: mockUserDto.cpf,
                email: mockUserDto.email,
            }));
        });
    });

    describe('getUser', () => {
        it('should return a user when found by CPF', async () => {
            userRepository.getUserByCpf.mockReturnValueOnce(of(mockUserEntity));

            const result$ = userUseCase.getUser(mockUserDto.cpf);

            const result = await firstValueFrom(result$);

            expect(userRepository.getUserByCpf).toHaveBeenCalledWith(mockUserDto.cpf);
            expect(result).not.toBeNull();
            expect(result.email).toBe(mockUserDto.email);
        });

        it('should throw error if user is not found', async () => {
            userRepository.getUserByCpf.mockReturnValueOnce(of(null));

            await expect(firstValueFrom(userUseCase.getUser('00000000000'))).rejects.toThrow(
                new HttpCustomErrors('[ERROR] User not found: 00000000000', HttpStatus.NOT_FOUND),
            );
        });
    });

    describe('deleteUser', () => {
        it('should delete a user by CPF', async () => {
            userRepository.deleteUserByCpf.mockReturnValueOnce(of(undefined));

            await userUseCase.deleteUser(mockUserDto.cpf);

            expect(userRepository.deleteUserByCpf).toHaveBeenCalledWith(mockUserDto.cpf);
        });

        it('should emit error from observable', (done) => {
            const error = new HttpCustomErrors('[ERROR]', 500);
            userRepository.deleteUserByCpf.mockReturnValueOnce(throwError(() => error));

            userUseCase.deleteUser(mockUserDto.cpf).subscribe({
                next: () => done('Expected error, but got success'),
                error: (err) => {
                    expect(err).toBe(error);
                    done();
                }
            });
        });
    });

    describe('updateUser', () => {
        it('should update a user and return updated user dto', async () => {
            userRepository.updateUser.mockReturnValueOnce(of(mockUserDto));

            const result = await firstValueFrom(userUseCase.updateUser(mockUserDto));

            expect(userRepository.updateUser).toHaveBeenCalledWith(mockUserDto);
            expect(result).toMatchObject({
                firstName: mockUserDto.firstName,
                lastName: mockUserDto.lastName,
                email: mockUserDto.email,
                cpf: mockUserDto.cpf,
            });
        });


        it('should throw HttpCustomErrors if update fails', async () => {
            const error = new HttpCustomErrors('[ERROR] Failed to update user', HttpStatus.BAD_REQUEST);
            userRepository.updateUser.mockReturnValueOnce(throwError(() => error));

            await expect(firstValueFrom(userUseCase.updateUser(mockUserDto))).rejects.toThrow(error);
            expect(userRepository.updateUser).toHaveBeenCalledWith(mockUserDto);
        });
    });
});