/**
 * Setup express server.
 */

import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import helmet from "helmet";
import express, { Request, Response, NextFunction } from "express";
import logger from "jet-logger";
import cors from "cors";

import "express-async-errors";

import config from "~/config";
import { NodeEnvs } from "~/common/misc";
import router from "./routes";
import { ReasonPhrases, StatusCodes } from "~/common/httpStatusCode";
import { TErr } from "./helpers/asyncHandler";
import configCors from "~/config/cors";

// **** Variables **** //

const app = async () => {
    const app = express();
    if (config.NodeEnv === "production") app.set("trust proxy", 1);
    // **** Setup **** //

    // Basic middleware
    app.use(cors(configCors));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser(config.CookieProps.Secret));

    // Show routes called in console during development
    if (config.NodeEnv === NodeEnvs.Dev.valueOf()) {
        app.use(morgan("dev"));
    }

    // Security
    if (config.NodeEnv === NodeEnvs.Production.valueOf()) {
        app.use(helmet());
    }

    app.use("/", router);

    app.use((req, res, next) => {
        const error: TErr = new Error(ReasonPhrases.NOT_FOUND);
        error.status = StatusCodes.NOT_FOUND;
        next(error);
    });

    // Add error handler
    app.use(
        (
            err: TErr,
            _: Request,
            res: Response,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            next: NextFunction
        ) => {
            if (config.NodeEnv !== NodeEnvs.Test.valueOf() && !err?.status) {
                logger.err(err, true);
            }
            const statusCode = err.status || StatusCodes.INTERNAL_SERVER_ERROR;

            return res.status(statusCode).json({
                status: statusCode,
                type: "error",
                message: err.message || ReasonPhrases.INTERNAL_SERVER_ERROR,
                errCode: err.errCode,
            });
        }
    );

    const staticDir = path.join(__dirname, "../public");
    app.use(express.static(staticDir));

    return app;
};

// **** Export default **** //

export default app;
