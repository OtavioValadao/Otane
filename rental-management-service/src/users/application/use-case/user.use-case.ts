import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { catchError, map, Observable, throwError } from "rxjs";
import { MongoUserRepository } from "../../infra/repositories/mongo.users.repository";
import { UserRabbitMqPublisher } from "../../infra/messaging/user.rabbitMq.publisher";
import { UserDto } from "../dtos/user.dto";
import { toUserDto, toUserEntity } from "../mappers/user.mapper";
import { HttpCustomErrors } from "../../interface/exceptions/http.custom.error.erros";

@Injectable()
export class UserUseCase {

    private readonly logger = new Logger(UserUseCase.name)

    constructor(
        private readonly userRepository: MongoUserRepository,
        private readonly userPublisher: UserRabbitMqPublisher,
    ) { }

    createUser(user: UserDto): Observable<UserDto> {
        this.logger.log('[INFO] try to create new user:', user)
        const userEntity = toUserEntity(user);
        return this.userRepository.saveUser(userEntity).pipe(
            map(createdUser => {
                this.logger.log(`[INFO] User created successfully: ${createdUser.firstName}`);

                this.userPublisher.sendWelcomeEmail(toUserDto(createdUser)).subscribe({
                    next: () => this.logger.log('Send message successfully'),
                    error: err => this.logger.error('Error to send message', err),
                });

                return toUserDto(createdUser);
            }),
            catchError(error => {
                this.logger.error('[ERROR] Error in createUser', error.stack || error.message);
                return throwError(() => error);
            })
        );
    }


    getUser(cpf: string): Observable<UserDto> {
        return this.userRepository.getUserByCpf(cpf).pipe(
            map(user => {
                if (!user) {
                    throw new HttpCustomErrors(`[ERROR] User not found: ${cpf}`, HttpStatus.NOT_FOUND);
                }
                return toUserDto(user);
            })
        );
    }


    deleteUser(cpf: string): Observable<void> {
        return this.userRepository.deleteUserByCpf(cpf).pipe(
            map(() => this.logger.log(`[INFO] User ${cpf} deleted (soft)`)),
            catchError(err => {
                this.logger.error('[ERROR] Failed to delete user:', err.stack);
                throw err;
            })
        );
    }

    updateUser(userDto: UserDto): Observable<UserDto> {
        this.logger.log('[INFO] try to update user:', userDto);

        const userEntity = toUserEntity(userDto);

        return this.userRepository.updateUser(userEntity).pipe(
            map(updatedUser => {
                this.logger.log(`[INFO] User updated successfully: ${updatedUser.firstName}`);
                return toUserDto(updatedUser);
            }),
            catchError(error => {
                this.logger.error('[ERROR] Error in updateUser', error.stack || error.message);
                return throwError(() => new HttpCustomErrors('[ERROR] Failed to update user', HttpStatus.BAD_REQUEST));
            }));
    }
}