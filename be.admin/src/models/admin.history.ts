import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import Admin from "./admin";
import { AdminHistoryModelEntity } from "~/type/app.entities";

class AdminHistory extends Model<AdminHistoryModelEntity, Optional<AdminHistoryModelEntity, 'id'>> implements AdminHistoryModelEntity {
    public id!: number
    public admin_id!: number
    public action!: 'get' | 'post' | 'put' | 'delete' | 'restore'
    public model!: string
    public data_input!: string
    public init_value!: string | null
    public change_value!: string
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
    public readonly deletedAt?: Date

    static initModel(sequelize: Sequelize) {
        AdminHistory.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                admin_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'Admin',
                        key: 'id'
                    },
                    onUpdate: 'CASCADE'
                },
                action: {
                    type: DataTypes.ENUM('get', 'post', 'put', 'delete', 'restore'),
                    allowNull: false
                },
                model: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                data_input: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                init_value: {
                    type: DataTypes.TEXT,
                    allowNull: true
                },
                change_value: {
                    type: DataTypes.TEXT,
                    allowNull: false
                }
            },
            {
                sequelize,
                modelName: 'AdminHistory',
                timestamps: true,
                paranoid: true
            }
        );

        return AdminHistory;
    }

    static associate(model: any) {
        Admin.hasMany(AdminHistory, {
            foreignKey: 'admin_id',
            as: 'adminhistories'
        });
        AdminHistory.belongsTo(Admin, {
            foreignKey: 'admin_id',
            as: 'admins'
        });
    }
}

export default AdminHistory;