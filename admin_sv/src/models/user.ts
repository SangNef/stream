import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

export enum Role {
    CREATOR = "creator",
    USER = "user",
}

interface UserAttributes {
    id?: number;
    fullname: string;
    username: string;
    password: string;
    role: Role;
    balance: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class User extends Model<UserAttributes, Optional<UserAttributes, "id">> implements UserAttributes {
    public id!: number;
    public fullname!: string;
    public username!: string;
    public password!: string;
    public role!: Role;
    public balance!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof User {
        User.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                fullname: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                username: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                role: {
                    type: DataTypes.ENUM(Role.CREATOR, Role.USER),
                    allowNull: false,
                },
                balance: {
                    type: DataTypes.DECIMAL(10, 2),
                    defaultValue: 0.0,
                },
            },
            {
                sequelize: sql,
                tableName: "users",
                paranoid: true,
                timestamps: true,
            }
        );
        return User;
    }
    static associate(models: any) {
        User.hasMany(models.Bank, {
            foreignKey: "user_id",
            as: "banks",
        });
        User.hasMany(models.Transaction, {
            foreignKey: "user_id",
            as: "transactions",
        });
        User.hasMany(models.Follower, {
            foreignKey: "user_id",
            as: "followers",
        });
        User.hasMany(models.Follower, {
            foreignKey: "creator_id",
            as: "following",
        });
        User.hasMany(models.Stream, {
            foreignKey: "user_id",
            as: "streams",
        });
        User.hasMany(models.Donate, {
            foreignKey: "user_id",
            as: "donates",
        });
        User.hasMany(models.Comment, {
            foreignKey: "user_id",
            as: "comments",
        });
        User.hasMany(models.Notification, {
            foreignKey: "user_id",
            as: "notifications",
        });
    }
}
