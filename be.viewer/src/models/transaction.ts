import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import User from "./user";
import { TransactionModelEntity, TransactionStatus, TransactionType } from "~/type/app.entities";

class TransactionModel extends Model<TransactionModelEntity, Optional<TransactionModelEntity, 'id'>> implements TransactionModelEntity {
    public id!: number
    public user_id!: number
    public type!: TransactionType
    public amount!: number
    public status!: TransactionStatus
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
    public readonly deletedAt?: Date

    static initModel (sequelize: Sequelize) {
        TransactionModel.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                user_id: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'User',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE',
                },
                type: {
                    type: DataTypes.ENUM(...Object.values(TransactionType)),
                    allowNull: false
                },
                amount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(TransactionStatus)),
                    allowNull: false,
                    defaultValue: 'pending'
                }
            },
            {
                sequelize,
                modelName: 'Transaction',
                timestamps: true,
                paranoid: true
            }
        );

        return TransactionModel;
    }

    static associate (model: any) {
        User.hasMany(TransactionModel, {
            foreignKey: 'user_id',
            as: 'transactions'
        });
        TransactionModel.belongsTo(User, {
            foreignKey: 'user_id',
            as: 'users'
        });
    }
}

export default TransactionModel;