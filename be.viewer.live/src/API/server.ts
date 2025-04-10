import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import initRouter from "../API/routes"
import cookieParser from "cookie-parser";
import path from "path";
import { TErr } from "./helpers/asyncHandler";
import { NodeEnvs } from "../common/misc";
import logger from "jet-logger";
import { StatusCodes, ReasonPhrases } from "../common/httpStatusCode";
import config from "~/config";

const appMain = async () => {
  const app = express();

  // Middleware CORS
  const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    // Chặn trình duyệt cache file .m3u8
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Expires", "0");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
  };
  app.use(corsMiddleware as any);
  app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

  app.use(bodyParser.json());
  // cookie
  app.use(cookieParser());
  // Show routes called in console during development
  if (config.NodeEnv === NodeEnvs.Dev.valueOf()) {
    app.use(morgan("dev"));
  }

  // Security
  if (config.NodeEnv === NodeEnvs.Production.valueOf()) {
      app.use(helmet());
  }
  app.use("/", express.static(path.join(__dirname, "../../public/uploads")));
  app.use("/api", initRouter);

  app.use((req: Request, res: Response, next: NextFunction) => {
    const error: TErr = new Error("Not found");
    error.status = 404;
    next(error);
  });

  const errHandle = (
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
  app.use(errHandle as any);

  return app;
}

export default appMain;