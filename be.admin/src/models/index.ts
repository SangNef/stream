import { Sequelize, DataTypes } from "sequelize";
import fs from "fs";
import path from "path";
import sql from "~/config/database";
import Admin from "./admin";
import ConfigModel from "./config";
import User from "./user";
import TransactionModel from "./transaction";
import AdminAction from "./admin.history";
import Stream from "./stream";
import Comment from "./comment";
import Notification from "./notification";
import Follower from "./follower";
import DonateItemModel from "./donate.item";
import Bank from "./bank";
import Donate from "./donate";

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "123";
const db: any = { ConfigModel, Admin, User, TransactionModel, AdminAction, Stream, DonateItemModel, Comment, Notification, Follower, Bank, Donate };

db.ConfigModel.initModel(sql);
db.Admin.initModel(sql);
db.User.initModel(sql);
db.TransactionModel.initModel(sql);
db.AdminAction.initModel(sql);
db.Stream.initModel(sql);
db.DonateItemModel.initModel(sql);
db.Comment.initModel(sql);
db.Notification.initModel(sql);
db.Follower.initModel(sql);
db.Bank.initModel(sql);
db.Donate.initModel(sql);

// Khởi tạo Sequelize từ config.ts
const config = require(path.resolve(__dirname, "../config/config.js"))[env];
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config,
    dialect: "mysql",
    logging: false,
  }
);

// Load tất cả models trong thư mục này
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".ts" &&
      file.indexOf(".test.ts") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    if (model.initModel) {
        model.initModel(sequelize);
        db[model.name] = model;
    }
    db[model.name] = model;
  });

// Thiết lập quan hệ giữa các models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export {
  ConfigModel,
  Admin,
  User,
  TransactionModel,
  AdminAction,
  Stream,
  DonateItemModel,
  Comment,
  Notification,
  Follower,
  Bank,
  Donate,
  sequelize as sequelize,
  Sequelize as Sequelize,
};