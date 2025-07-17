import { Observable } from "rxjs";
import { UserEntity } from "../entities/user.entity";
import { UserDto } from "../dtos/user.dto";


export interface UserRepository {
    saveUser(user: UserEntity): Observable<UserDto>;
    getUserByCpf(cpf: string): Observable<UserEntity | null>;
    deleteUserByCpf(cpf: string): Observable<void>;
}