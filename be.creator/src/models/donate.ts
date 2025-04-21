import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { DonateModelEntity } from "~/type/app.entities";
import User from "./user";
import DonateItemModel from "./donate.item";
import Stream from "./stream";

class Donate extends Model<DonateModelEntity, Optional<DonateModelEntity, 'id'>> implements DonateModelEntity {
    public id!: number
    public user_id!: number
    public item_id!: number
    public stream_id!: number
    public amount!: number
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
    public readonly deletedAt?: Date | null

    static initModel(sequelize: Sequelize) {
        Donate.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: User,
                        key: 'id'
                    },
                    onUpdate: 'CASCADE'
                },
                item_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: DonateItemModel,
                        key: 'id'
                    },
                    onUpdate: 'CASCADE'
                },
                stream_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: Stream,
                        key: 'id'
                    },
                    onUpdate: 'CASCADE'
                },
                amount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false
                }
            },
            {
                sequelize,
                modelName: 'Donate',
                timestamps: true,
                paranoid: true
            }
        );

        return Donate;
    }

    static associate (model: any) {
        User.hasMany(Donate, {
            foreignKey: 'user_id',
            as: 'donates'
        });
        Donate.belongsTo(User, {
            foreignKey: 'user_id',
            as: 'users'
        });

        DonateItemModel.hasMany(Donate, {
            foreignKey: 'item_id',
            as: 'donates'
        });
        Donate.belongsTo(DonateItemModel, {
            foreignKey: 'item_id',
            as: 'donateitems'
        });

        Stream.hasMany(Donate, {
            foreignKey: 'stream_id',
            as: 'donates'
        });
        Donate.belongsTo(Stream, {
            foreignKey: 'stream_id',
            as: 'streams'
        });
    }
}

export default Donate