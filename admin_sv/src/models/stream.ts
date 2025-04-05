'use strict';
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

export enum Status {
    PENDING = "pending",
    CREATED = "created",
    ENDED = "ended",
}

interface StreamAttributes {
    id?: number;
    user_id: number;
    thumbnail: string;
    title: string;
    views: number;
    status: Status;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class Stream extends Model<StreamAttributes, Optional<StreamAttributes, "id">> implements StreamAttributes {
    public id!: number;
    public user_id!: number;
    public thumbnail!: string;
    public title!: string;
    public views!: number;
    public status!: Status;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof Stream {
        Stream.init(
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
                thumbnail: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                views: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                },
                status: {
                    type: DataTypes.ENUM(Status.PENDING, Status.CREATED, Status.ENDED),
                    defaultValue: Status.PENDING,
                },
            },
            {
                sequelize: sql,
                tableName: "streams",
                paranoid: true,
                timestamps: true,
            }
        );

        return Stream;
    }
    static associate(models: any) {
        Stream.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
    }
}