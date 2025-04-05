import { Sequelize } from "sequelize";
import config from "./index";

const sql = new Sequelize(
  config.Database.name,
  config.Database.user,
  config.Database.pass,
  {
    host: config.Database.host,
    port: Number(config.Database.port),
    dialect: "mysql",
    logging: false,
  }
);

export default sql;
