import { Body, Controller, Delete, Get, Headers, HttpCode, Post, Put } from "@nestjs/common";
import { Observable } from "rxjs";
import { TentantDto } from "../../application/dtos/tentant.dto";
import { TentantUseCase } from "../../application/use-case/tentat.use-case";

@Controller('tentants')
export class TentantController {

    constructor(private readonly tentantUseCase: TentantUseCase) { }

    @Post()
    @HttpCode(201)
    createTentant(@Body() tentantDto: TentantDto): Observable<TentantDto> {
        return this.tentantUseCase.createTentant(tentantDto);
    }

    @Get()
    @HttpCode(200)
    getTentant(@Headers('cpf') cpf: string): Observable<TentantDto> {
        return this.tentantUseCase.getTentant(cpf);
    }

    @Delete()
    @HttpCode(204)
    deleteTentant(@Headers('cpf') cpf: string) {
        return this.tentantUseCase.deleteTentant(cpf);
    }

    @Put()
    @HttpCode(200)
    updateTentant(@Body() tentantDto: TentantDto): Observable<TentantDto> {
        return this.tentantUseCase.updateTentant(tentantDto);
    }
}
