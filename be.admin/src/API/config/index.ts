import "dotenv/config";

export default {
    NodeEnv: process.env.NODE_ENV ?? "",
    Port: process.env.PORT ?? 5200,
    CookieProps: {
        Key: "ExpressGeneratorTs",
        Secret: process.env.COOKIE_SECRET ?? "",
        // Casing to match express cookie options
        Options: {
            httpOnly: true,
            signed: true,
            path: process.env.COOKIE_PATH ?? "",
            maxAge: Number(process.env.COOKIE_EXP ?? 0),
            domain: process.env.COOKIE_DOMAIN ?? "",
            secure: process.env.SECURE_COOKIE === "true",
        },
    },
    Database: {
        dialect: process.env.DB_DIALECT || "mysql",
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USERNAME || "root",
        pass: process.env.DB_PASSWORD || "dinhsang2309",
        name: process.env.DB_DATABASE || "livestream",
        port: process.env.DB_PORT || 3306,
    },
    Jwt: {
        Secret: process.env.JWT_SECRET ?? "cozhvjaosdkjfkldfadf",
        Exp: Number(process.env.COOKIE_EXP ?? 259200000), // exp at the same time as the cookie
    },
} as const;