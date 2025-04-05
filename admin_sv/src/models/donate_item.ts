'use strict';
import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import sql from "~/config/database";

interface DonateItemAttributes {
    id?: number;
    name: string;
    image: string;
    price: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export class DonateItem
    extends Model<DonateItemAttributes, Optional<DonateItemAttributes, "id">>
    implements DonateItemAttributes
{
    public id!: number;
    public name!: string;
    public image!: string;
    public price!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date | null;

    static initModel(sequelize: Sequelize): typeof DonateItem {
        DonateItem.init(
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
                image: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                price: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
            },
            {
                sequelize: sql,
                tableName: "donate_items",
                paranoid: true,
                timestamps: true,
            }
        );

        return DonateItem;
    }
    static associate(models: any) {
        DonateItem.hasMany(models.Donate, {
            foreignKey: "item_id",
            as: "donates",
        });
    }
}