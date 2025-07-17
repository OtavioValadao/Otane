import { Exclude, Expose } from "class-transformer";
import { IsDate, IsEmail, IsInt, IsString } from "class-validator";
import { Types } from "mongoose";


export class UserDto {
    @Exclude()
    _id: Types.ObjectId;

    @Exclude()
    __v: number;

    @Expose()
    @IsString()
    firstName: string;

    @Expose()
    @IsString()
    lastName: string;

    @Expose()
    @IsEmail()
    email: string;

    @Expose()
    @IsInt()
    age: number;

    @Expose()
    @IsDate()
    bornDate: Date;

    @Exclude()
    isActive: boolean;

    @Expose()
    @IsString()
    cpf: string;
}