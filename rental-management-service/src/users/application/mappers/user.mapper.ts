import { plainToInstance } from "class-transformer";
import { UserDto } from "../dtos/user.dto";
import { UserEntity } from "../../domain/entities/user.entity";

export const toUserEntity = (userDto: UserDto): UserEntity => {
    return plainToInstance(UserEntity, userDto);
};

export const toUserDto = (user: UserEntity): UserDto => {
    return plainToInstance(UserDto, user);
}