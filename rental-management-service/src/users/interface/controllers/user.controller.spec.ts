import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { Types } from 'mongoose';
import { UserUseCase } from '../../application/use-case/user.use-case';
import { UserDto } from '../../application/dtos/user.dto';

describe('UserController', () => {
    let userController: UserController;
    let userUseCase: UserUseCase;

    const mockUserDto: UserDto = {
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
    const mockUserUseCase = {
        createUser: jest.fn().mockResolvedValue(mockUserDto),
        getUser: jest.fn().mockResolvedValue(mockUserDto),
        deleteUser: jest.fn().mockResolvedValue(mockUserDto),
        updateUser: jest.fn().mockResolvedValue(mockUserDto),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserUseCase,
                    useValue: mockUserUseCase,
                },
            ],
        }).compile();

        userController = module.get<UserController>(UserController);
        userUseCase = module.get<UserUseCase>(UserUseCase);
    });

    it('should be defined', () => {
        expect(userController).toBeDefined();
    });

    describe('createUser', () => {
        it('should call userUseCase.createUser and return the created user', async () => {
            const result = await userController.createUser(mockUserDto);

            expect(userUseCase.createUser).toHaveBeenCalledWith(mockUserDto);
            expect(result).toEqual(mockUserDto);
        });
    });

    describe('getUser', () => {
        it('should call userUseCase.getUser with CPF and return the user', async () => {
            const cpf = '12345678900';
            const result = await userController.getUser(cpf);

            expect(userUseCase.getUser).toHaveBeenCalledWith(cpf);
            expect(result).toEqual(mockUserDto);
        });
    });

    describe('deleteUser', () => {
        it('should call userUseCase.deleteUser with CPF', async () => {
            const cpf = '12345678900';
            await userController.deleteUser(cpf);

            expect(userUseCase.deleteUser).toHaveBeenCalledWith(cpf);
        });
    });


    describe('updateUser', () => {
       
        it('should call userUseCase.updateUser and return the updated user', async () => {
            const result = await userController.updateUser(mockUserDto);

            expect(userUseCase.updateUser).toHaveBeenCalledWith(mockUserDto);
            expect(result).toEqual(mockUserDto);
        });
    });
});
