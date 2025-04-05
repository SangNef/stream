"use strict";
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

interface CommentAttributes {
    id?: number;
    user_id: number;
    stream_id: number;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class Comment extends Model<CommentAttributes, Optional<CommentAttributes, "id">> implements CommentAttributes {
    public id!: number;
    public user_id!: number;
    public stream_id!: number;
    public content!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof Comment {
        Comment.init(
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
                content: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
            },
            {
                sequelize: sql,
                tableName: "comments",
                paranoid: true,
                timestamps: true,
            }
        );

        return Comment;
    }
    static associate(models: any) {
        Comment.belongsTo(models.User, {
            foreignKey: "user_id",
            as: "user",
        });
        Comment.belongsTo(models.Stream, {
            foreignKey: "stream_id",
            as: "stream",
        });
    }
}
