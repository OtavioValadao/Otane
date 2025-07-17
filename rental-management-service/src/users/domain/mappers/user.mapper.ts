import { plainToInstance } from "class-transformer";
import { UserEntity } from "../entities/user.entity";
import { UserDto } from "../dtos/user.dto";

export const toUserEntity = (userDto: UserDto): UserEntity => {
    return plainToInstance(UserEntity, userDto);
};

export const toUserDto = (user: UserEntity): UserDto => {
    return plainToInstance(UserDto, user);
}