'use strict';
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

interface ConfigAttributes {
    id?: number;
    key: string;
    value: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class Config extends Model<ConfigAttributes, Optional<ConfigAttributes, "id">> implements ConfigAttributes {
    public id!: number;
    public key!: string;
    public value!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof Config {
        Config.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                key: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                value: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                sequelize: sql,
                tableName: "configs",
                timestamps: true,
                paranoid: true,
            }
        );
        return Config;
    }
}