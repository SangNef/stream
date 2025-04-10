import { Response } from "express";

class SuccessResponse {
  metadata: {};
  message: string;
  status: number;
  code: number;

  constructor({ metadata = {}, message = "", status = 200, code = 0 }) {
    this.metadata = metadata;
    this.message = message;
    this.status = status;
    this.code = code;
  }

  send = (res: Response, header = {}) => {
    res.header(header).status(this.status).json({
      status: this.status,
      code: this.code,
      metadata: this.metadata,
      message: this.message,
    });
  };
}

export class OK extends SuccessResponse {
  constructor({ metadata = {}, message = "OK" }) {
    super({ metadata, message, status: 200, code: 0 });
  }
}

export class CREATED extends SuccessResponse {
  constructor({ metadata = {}, message = "CREATED" }) {
    super({ metadata, message, status: 201, code: 0 });
  }
}
