import { ReasonPhrases, StatusCodes } from "~/common/httpStatusCode";

export class ErrorResponse extends Error {
    status: number;
    errCode: number;
    constructor(message: string, status: number, errCode: number) {
        super(message);
        this.status = status;
        this.errCode = errCode;
    }
}

export class ConflictRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.CONFLICT, errCode = 0, statusCode = StatusCodes.CONFLICT) {
        super(message, statusCode, errCode);
    }
}

export class BadRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.BAD_REQUEST, errCode = 0, statusCode = StatusCodes.BAD_REQUEST) {
        super(message, statusCode, errCode);
    }
}

export class ForbiddenRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.FORBIDDEN, errCode = 0, statusCode = StatusCodes.FORBIDDEN) {
        super(message, statusCode, errCode);
    }
}

export class AuthFailureRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.UNAUTHORIZED, errCode = 0, statusCode = StatusCodes.UNAUTHORIZED) {
        super(message, statusCode, errCode);
    }
}

export class NotFoundRequestError extends ErrorResponse {
    constructor(message = ReasonPhrases.NOT_FOUND, errCode = 0, statusCode = StatusCodes.NOT_FOUND) {
        super(message, statusCode, errCode);
    }
}
