"use strict";
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

interface DonateAttributes {
    id?: number;
    user_id: number;
    item_id: number;
    stream_id: number;
    amount: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class Donate extends Model<DonateAttributes, Optional<DonateAttributes, "id">> implements DonateAttributes {
    public id!: number;
    public user_id!: number;
    public item_id!: number;
    public stream_id!: number;
    public amount!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof Donate {
        Donate.init(
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
                item_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "donate_items",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
                stream_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "streams",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
                amount: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
            },
            {
                sequelize: sql,
                tableName: "donates",
                paranoid: true,
                timestamps: true,
            }
        );

        return Donate;
    }
    static associate(models: any) {
        Donate.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
        Donate.belongsTo(models.Stream, {
            foreignKey: "stream_id",
            as: "stream",
        });
        Donate.belongsTo(models.DonateItem, {
            foreignKey: "item_id",
            as: "item",
        });
    }
}
