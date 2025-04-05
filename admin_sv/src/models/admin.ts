'use strict';
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

export enum AdminRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
}

interface AdminAttributes {
    id?: number;
    name: string;
    email: string;
    password: string;
    role: AdminRole;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class Admin extends Model<AdminAttributes, Optional<AdminAttributes, "id">> implements AdminAttributes {
    public id!: number;
    public name!: string;
    public email!: string;
    public password!: string;
    public role!: AdminRole;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof Admin {
        Admin.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                role: {
                    type: DataTypes.ENUM(...Object.values(AdminRole)),
                    allowNull: false,
                },
            },
            {
                sequelize: sql,
                tableName: "admins",
                timestamps: true,
                paranoid: true,
            }
        );
        return Admin;
    }
    static associate(models: any) {
        Admin.hasMany(models.AdminAction, {
            foreignKey: "admin_id",
            as: "actions",
        });
    }
}