"use strict";
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

interface BankAttributes {
    id?: number;
    user_id: number;
    bank_name: string;
    bank_account: string;
    bank_username: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class Bank extends Model<BankAttributes, Optional<BankAttributes, "id">> implements BankAttributes {
    public id!: number;
    public user_id!: number;
    public bank_name!: string;
    public bank_account!: string;
    public bank_username!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof Bank {
        Bank.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "users",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
                bank_name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                bank_account: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                bank_username: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                sequelize: sql,
                tableName: "banks",
                paranoid: true,
                timestamps: true,
            }
        );
        return Bank;
    }
    static associate(models: any) {
        Bank.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
    }
}
