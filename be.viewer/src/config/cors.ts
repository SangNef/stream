import { CorsOptions } from "cors";
import { HEADER } from "~/common/header";

const configCors: CorsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = ["http://localhost:5173"];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    preflightContinue: false,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization", HEADER.clientId, HEADER.accessToken],
    exposedHeaders: [HEADER.clientId, HEADER.authorization],
};


export default configCors;
