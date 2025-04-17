import { Application, NextFunction, Request, Response } from "express";

export interface TErr extends Error {
    status?: number;
    errCode?: number;
}

type TFn = (req: Request, res: Response, next: NextFunction) => Application | Promise<void>;

const asyncHandler = (fn: TFn) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await fn(req, res, next);
    } catch (err) {
        if (!err?.status) console.log(new Date(), err);
        next(err);
    }
};

export default asyncHandler;
