import { Observable } from "rxjs";
import { UserDto } from "../dtos/user.dto";

export interface UserPublisherPort {
    sendWelcomeEmail(user: UserDto): Observable<void>;
}