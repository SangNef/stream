import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import fs from "fs";
import path from "path";
import { User } from "./user";
import { Bank } from "./bank";
import sql from "~/config/database";
import { Transaction } from "./transaction";
import { Follower } from "./follower";
import { Stream } from "./stream";
import { Comment } from "./comment";
import { Notification } from "./notification";
import { Donate } from "./donate";
import { DonateItem } from "./donate_item";
import { Config } from "./config";
import { Admin } from "./admin";
import { AdminAction } from "./admin_action";

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "123";
const db: any = {
    User,
    Bank,
    Transaction,
    Follower,
    Stream,
    Comment,
    Notification,
    DonateItem,
    Donate,
    Config,
    Admin,
    AdminAction,
};

db.User.initModel(sql);
db.Bank.initModel(sql);
db.Transaction.initModel(sql);
db.Follower.initModel(sql);
db.Stream.initModel(sql);
db.Comment.initModel(sql);
db.Notification.initModel(sql);
db.Donate.initModel(sql);
db.DonateItem.initModel(sql);
db.Config.initModel(sql);
db.Admin.initModel(sql);
db.AdminAction.initModel(sql);

// Khởi tạo Sequelize từ config.ts
const config = require(path.resolve(__dirname, "../config/config.js"))[env];
const sequelize = new Sequelize(config.database, config.username, config.password, {
    ...config,
    dialect: "mysql",
    logging: false,
});

// Load tất cả models trong thư mục này
fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".ts" && file.indexOf(".test.ts") === -1
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
Object.values(db).forEach((model: any) => {
    if (typeof model.associate === "function") {
        model.associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export {
    User,
    Bank,
    Transaction,
    Follower,
    Stream,
    Comment,
    Notification,
    DonateItem,
    Donate,
    Config,
    Admin,
    AdminAction,
    sequelize as sequelize,
    Sequelize as Sequelize,
};
