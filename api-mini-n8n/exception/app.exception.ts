
export class AppException extends Error {

    constructor(
        message: string, 
        readonly name: string,
        readonly code: number = 500) {
        super(message);
    }

    getCode() {
        return this.code;
    }

    getName() {
        return this.name;
    }
}