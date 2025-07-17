import { HttpException, HttpStatus } from "@nestjs/common";

export class HttpCustomErrors extends HttpException {

    constructor(
        message: string,
        statusCode: HttpStatus
    ) {
        super(message, statusCode);
    }
}