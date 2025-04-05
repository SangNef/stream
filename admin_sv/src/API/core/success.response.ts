import { Response } from "express";
import { ReasonPhrases, StatusCodes } from "~/common/httpStatusCode";

class SuccessResponse {
    message: string;
    status: number;
    metadata: Object;
    constructor({ message = ReasonPhrases.OK, statusCode = StatusCodes.OK, metadata = {} }) {
        this.message = message;
        this.status = statusCode;
        this.metadata = metadata;
    }

    send = (res: Response, headers?: Object) => {
        if (headers) res.set(headers).status(this.status).json(this);
        else res.status(this.status).json(this);
    };

    download = (res: Response) => {
        res.setHeader("Content-Disposition", 'attachment; filename="data.xlsx"');
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(this.metadata);
    };
}

export class OK extends SuccessResponse {
    constructor({ message = ReasonPhrases.OK, metadata = {} }) {
        super({ message, metadata });
    }
}

export class CREATED extends SuccessResponse {
    constructor({ message = ReasonPhrases.CREATED, statusCode = StatusCodes.CREATED, metadata = {} }) {
        super({ message, statusCode, metadata });
    }
}
