import { AppException } from "./app.exception";

export class NotFoundException extends AppException {
    constructor(message: string) {
        super(message, "NOT_FOUND", 404);
    }
}