import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { BankModelEntity } from "~/type/app.entities";
import User from "./user";

class Bank extends Model<BankModelEntity, Optional<BankModelEntity, 'id'>> implements BankModelEntity {
    public id!: number
    public user_id!: number
    public bank_name!: string
    public bank_account!: string
    public bank_username!: string
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
    public readonly deletedAt?: Date | null

    static initModel (sequelize: Sequelize) {
        Bank.init(
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
                bank_name: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                bank_account: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                bank_username: {
                    type: DataTypes.STRING,
                    allowNull: false
                }
            },
            {
                sequelize,
                modelName: 'Bank',
                timestamps: true,
                paranoid: true
            }
        );

        return Bank;
    }

    static associate (model: any) {
        User.hasMany(Bank, {
            foreignKey: 'user_id',
            as: 'banks'
        });
        Bank.belongsTo(User, {
            foreignKey: 'user_id',
            as: 'users'
        });
    }
}

export default Bank;