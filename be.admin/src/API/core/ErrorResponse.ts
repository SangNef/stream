class ErrorResponse extends Error {
  status: number;
  errorCode: number;
  
  constructor(message: string, statusCode: number, errorCode: number) {
    super(message);
    this.status = statusCode;
    this.errorCode = errorCode;
  }
}

export class BadRequestResponse extends ErrorResponse {
  constructor(message = "Bad Request", errorCode = 1) {
    super(message, 400, errorCode);
  }
}

export class FobbiddenResponse extends ErrorResponse {
  constructor(message = "Forbidden", errorCode = 2) {
    super(message, 403, errorCode);
  }
}
export class Unauthorized extends ErrorResponse {
  constructor(message = "Unauthorized", errorCode = 3) {
    super(message, 401, errorCode);
  }
}

export class ConflictResponse extends ErrorResponse {
  constructor(message = "Conflict", errorCode = 4) {
    super(message, 409, errorCode);
  }
}

export class NotFoundResponse extends ErrorResponse {
  constructor(message = "Not Found", errorCode = 5) {
    super(message, 404, errorCode);
  }
}

export class InternalServerRespone extends ErrorResponse {
  constructor(message = "Internal Server", errorCode = 6){
    super(message, 500, errorCode);
  }
}

try {
} catch (error) {
  error;
}
