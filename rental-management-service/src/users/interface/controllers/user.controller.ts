import { Body, Controller, Delete, Get, Headers, HttpCode, Post, Put } from "@nestjs/common";
import { Observable } from "rxjs";
import { UserDto } from "../../application/dtos/user.dto";
import { UserUseCase } from "../../application/use-case/user.use-case";

@Controller('users')
export class UserController {

    constructor(private readonly userUseCase: UserUseCase) { }

    @Post()
    @HttpCode(201)
    createUser(@Body() userDto: UserDto): Observable<UserDto> {
        return this.userUseCase.createUser(userDto);
    }

    @Get()
    @HttpCode(200)
    getUser(@Headers('cpf') cpf: string): Observable<UserDto> {
        return this.userUseCase.getUser(cpf);
    }

    @Delete()
    @HttpCode(204)
    deleteUser(@Headers('cpf') cpf: string) {
        return this.userUseCase.deleteUser(cpf);
    }

    @Put()
    @HttpCode(200)
    updateUser(@Body() userDto: UserDto): Observable<UserDto> {
        return this.userUseCase.updateUser(userDto);
    }
}