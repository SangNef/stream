"use strict";
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

const enum Type {
    deposit = "deposit",
    withdraw = "withdraw",
}

const enum Status {
    pending = "pending",
    success = "success",
    cancel = "cancel",
}

interface TransactionAttributes {
    id?: number;
    user_id: number;
    type: Type;
    amount: number;
    status: Status;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class Transaction extends Model<TransactionAttributes, Optional<TransactionAttributes, "id">> implements TransactionAttributes {
    public id!: number;
    public user_id!: number;
    public type!: Type;
    public amount!: number;
    public status!: Status;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof Transaction {
        Transaction.init(
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
                type: {
                    type: DataTypes.ENUM(Type.deposit, Type.withdraw),
                    allowNull: false,
                },
                amount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM(Status.pending, Status.success, Status.cancel),
                    allowNull: false,
                },
            },
            {
                sequelize: sql,
                tableName: "transactions",
                paranoid: true,
                timestamps: true,
            }
        );
        return Transaction;
    }
    static associate(models: any) {
        Transaction.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
    }
}