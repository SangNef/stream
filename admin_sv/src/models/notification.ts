"use strict";
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

export enum Type {
    FOLLOW = "follow",
    LIVE = "live",
    TRANSACTION = "transaction",
}

interface NotificationAttributes {
    id?: number;
    user_id: number;
    type: Type;
    title: string;
    content: string;
    isRead: boolean;
    navigate_to: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class Notification
    extends Model<NotificationAttributes, Optional<NotificationAttributes, "id">>
    implements NotificationAttributes
{
    public id!: number;
    public user_id!: number;
    public type!: Type;
    public title!: string;
    public content!: string;
    public isRead!: boolean;
    public navigate_to!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof Notification {
        Notification.init(
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
                    type: DataTypes.ENUM(Type.FOLLOW, Type.LIVE, Type.TRANSACTION),
                    allowNull: false,
                },
                title: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                content: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                isRead: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: false,
                },
                navigate_to: {
                    type: DataTypes.JSON,
                    allowNull: false,
                },
            },
            {
                sequelize: sql,
                tableName: "notifications",
                paranoid: true,
                timestamps: true,
            }
        );

        return Notification;
    }
    static associate(models: any) {
        Notification.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
    }
}
