'use strict';
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

interface FollowerAttributes {
    id?: number;
    user_id: number;
    creator_id: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class Follower extends Model<FollowerAttributes, Optional<FollowerAttributes, "id">> implements FollowerAttributes {
    public id!: number;
    public user_id!: number;
    public creator_id!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof Follower {
        Follower.init(
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
                creator_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "users",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
            },
            {
                sequelize: sql,
                tableName: "followers",
                paranoid: true,
                timestamps: true,
            }
        );

        return Follower;
    }
    static associate(models: any) {
        Follower.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
        Follower.belongsTo(models.User, { foreignKey: "creator_id", as: "creator" });
    }
}