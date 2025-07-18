import { plainToInstance } from "class-transformer";
import { TentantDto } from "../dtos/tentant.dto";
import { TenantEntity } from "../../domain/entities/tenant.entity";

export const toTentantEntity = (tentantDto: TentantDto): TenantEntity => {
    return plainToInstance(TenantEntity, tentantDto);
};

export const toTentantDto = (tentantEntity: TenantEntity): TentantDto => {
    return plainToInstance(TentantDto, tentantEntity);
};