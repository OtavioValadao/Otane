import { Observable } from "rxjs";
import { UserDto } from "../../application/dtos/user.dto";

export interface UserPublisherPort {
    sendWelcomeEmail(user: UserDto): Observable<void>;
}