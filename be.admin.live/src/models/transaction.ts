import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import User from "./user";
import { TransactionModelEntity } from "~/type/app.entities";

class TransactionModel extends Model<TransactionModelEntity, Optional<TransactionModelEntity, 'id'>> implements TransactionModelEntity {
    public id!: number
    public implementer!: number
    public receiver!: number
    public type!: 'recharge' | 'donate' | 'withdraw'
    public is_success!: boolean
    public is_cancel!: boolean
    public value!: string
    public content!: string
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
                implementer: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                    references: {
                        model: 'User',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE'
                },
                receiver: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'User',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE'
                },
                type: {
                    type: DataTypes.ENUM('recharge', 'donate', 'withdraw'),
                    allowNull: false
                },
                is_success: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
                is_cancel: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: false
                },
                value: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false
                },
                content: {
                    type: DataTypes.STRING,
                    allowNull: true
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
            foreignKey: 'implementer',
            as: 'implementers'
        });
        TransactionModel.belongsTo(User, {
            foreignKey: 'implementer',
            as: 'user_imp'
        });
        
        User.hasMany(TransactionModel, {
            foreignKey: 'receiver',
            as: 'receivers'
        });
        TransactionModel.belongsTo(User, {
            foreignKey: 'receiver',
            as: 'user_rec'
        });
    }
}

export default TransactionModel;