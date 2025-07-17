import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { UserDto } from "../../domain/dtos/user.dto";
import { UserDocument, UserEntity } from "../../domain/entities/user.entity";
import { InjectModel } from "@nestjs/mongoose";
import { HttpCustomErrors } from "../../domain/errors/http.custom.error.erros";
import { catchError, defer, from, map, Observable, switchMap, throwError } from "rxjs";
import { log } from "console";
import { UserRepository } from "src/users/domain/repositories/user.repository";

@Injectable()
export class MongoUserRepository implements UserRepository {


    private readonly logger = new Logger(MongoUserRepository.name)

    constructor(
        @InjectModel(UserEntity.name) private readonly userModel: Model<UserDocument>,
    ) {
    }

    saveUser(user: UserEntity): Observable<UserDto> {
        return defer(async () => {
            try {
                const createdUser = new this.userModel(user);
                await createdUser.save();

                this.logger.log(`[INFO] User created successfully: ${createdUser.firstName}`);

                return createdUser.toObject();
            } catch (error) {
                this.logger.error('[ERROR] Error creating user', error.stack);
                throw new HttpCustomErrors(`Error creating user: ${user}`, HttpStatus.BAD_REQUEST);
            }
        });
    }

    getUserByCpf(cpf: string): Observable<UserEntity | null> {
        return defer(() =>
            this.userModel.findOne({ cpf, isActive: true }).lean().exec()
        ).pipe(
            catchError(error => {
                this.logger.error('[ERROR] Error when try to find user', error.stack);
                throw new HttpCustomErrors(`Error when try to find user: ${cpf}`, HttpStatus.BAD_REQUEST);
            })
        );
    }


    deleteUserByCpf(cpf: string): Observable<void> {
        return this.getUserByCpf(cpf).pipe(
            switchMap(user => {
                if (!user) {
                    this.logger.log(`[INFO] User not found for deletion: ${cpf}`);
                    return throwError(() => new HttpCustomErrors(`[ERROR] User not found for deletion: ${cpf}`, HttpStatus.NOT_FOUND));
                }
                this.logger.log(`[INFO] Attempting to delete user with CPF: ${user.firstName}`);
                return from(this.userModel.updateOne({ cpf }, { $set: { isActive: false } }).exec()).pipe(
                    map(() => undefined)
                );
            }),
            catchError(error => {
                this.logger.error('[ERROR] Error when try to delete user', error.stack);

                if (error instanceof HttpCustomErrors) {
                    return throwError(() => error);
                }
                return throwError(() => new HttpCustomErrors(
                    `Error when try to delete user: ${cpf}`,
                    HttpStatus.BAD_REQUEST,
                ));
            })
        );
    }


    updateUser(userEntity: UserEntity): Observable<UserDto> {
        return this.getUserByCpf(userEntity.cpf).pipe(
            switchMap(existingUser => {
                if (!existingUser) {
                    this.logger.warn(`[WARN] User not found for update: ${userEntity.cpf}`);
                    return throwError(() => new HttpCustomErrors(`User not found for update: ${userEntity.cpf}`, HttpStatus.NOT_FOUND));
                }

                this.logger.log(`[INFO] Updating user: ${userEntity.cpf}`);

                return from(
                    this.userModel.findOneAndUpdate(
                        { cpf: userEntity.cpf },
                        { $set: { ...userEntity } },
                        { new: true }
                    ).lean().exec()
                ).pipe(
                    map(updatedUser => {
                        if (!updatedUser) {
                            throw new HttpCustomErrors(`Failed to update user: ${userEntity.cpf}`, HttpStatus.BAD_REQUEST);
                        }

                        return updatedUser;
                    })
                );
            }),
            catchError(error => {
                this.logger.error('[ERROR] Error when trying to update user', error.stack);

                if (error instanceof HttpCustomErrors) {
                    return throwError(() => error);
                }

                return throwError(() =>
                    new HttpCustomErrors(`Unexpected error updating user: ${userEntity.cpf}`, HttpStatus.INTERNAL_SERVER_ERROR)
                );
            })
        );
    }

}