import { AppException } from "./app.exception";

export class BusinessException extends AppException {
    constructor(message: string) {
        super(message, "BUSINESS", 400);
    }
}