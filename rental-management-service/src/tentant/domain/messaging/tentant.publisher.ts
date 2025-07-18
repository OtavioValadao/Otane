import { Observable } from "rxjs";
import { TentantDto } from "../../application/dtos/tentant.dto";

export interface TentantPublisherPort {
    sendWeelcomeEmail(user: TentantDto): Observable<void>;
}