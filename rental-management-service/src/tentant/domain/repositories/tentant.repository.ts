import { Observable } from "rxjs";
import { TenantEntity } from "../entities/tenant.entity";
import { TentantDto } from "../../application/dtos/tentant.dto";

export interface TentantRepository {
    saveTentant(user: TenantEntity): Observable<TentantDto>;
    getTentantByCpf(cpf: string): Observable<TenantEntity | null>;
    deleteTentantByCpf(cpf: string): Observable<void>;
}