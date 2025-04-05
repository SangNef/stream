'use strict';
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

interface AdminActionAttributes {
    id?: number;
    admin_id: number;
    action: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class AdminAction extends Model<AdminActionAttributes, Optional<AdminActionAttributes, "id">> implements AdminActionAttributes {
    public id!: number;
    public admin_id!: number;
    public action!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof AdminAction {
        AdminAction.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                admin_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "admins",
                        key: "id",
                    },
                    onUpdate: "CASCADE",
                    onDelete: "CASCADE",
                },
                action: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                sequelize: sql,
                tableName: "admin_actions",
                timestamps: true,
                paranoid: true,
            }
        );
        return AdminAction;
    }
    static associate(models: any) {
        AdminAction.belongsTo(models.Admin, {
            foreignKey: "admin_id",
            as: "admin",
        });
    }
}