const dotenv = require("dotenv");
const path = require("path");
// import dotenv from "dotenv";
// import path from "path";

const env = process.env.NODE_ENV || "development";
const envFile = `.env.${env}`;

dotenv.config({ path: path.resolve(__dirname, "../../", envFile) });

module.exports = {
    development: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASS || "dinhsang2309",
        database: process.env.DB_NAME || "livestream",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        dialect: "mysql",
    },
    production: {
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASS || "dinhsang2309",
        database: process.env.DB_NAME || "livestream",
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 3306,
        dialect: "mysql",
    },
};