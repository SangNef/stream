import { Sequelize } from "sequelize";
import config from "./index";

const sequelize = new Sequelize(
  config.Database.name,
  config.Database.user,
  config.Database.pass,
  {
    host: config.Database.host,
    port: Number(config.Database.port),
    dialect: "mysql",
    logging: false,
    timezone: '+07:00',
    dialectOptions: {
      dateStrings: true,
      typeCast: function (field: any, next: any) {
        if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
          return field.string();
        }
        return next();
      },
    }
  }
);

export default sequelize;