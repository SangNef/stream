import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import Admin from "./admin";
import { AdminActionModelEntity } from "~/type/app.entities";

class AdminAction extends Model<AdminActionModelEntity, Optional<AdminActionModelEntity, 'id'>> implements AdminActionModelEntity {
    public id!: number
    public admin_id!: number
    public action!: string
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
    public readonly deletedAt?: Date

    static initModel(sequelize: Sequelize) {
        AdminAction.init(
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
                    type: DataTypes.STRING,
                    allowNull: false
                }
            },
            {
                sequelize,
                modelName: 'AdminAction',
                timestamps: true,
                paranoid: true
            }
        );

        return AdminAction;
    }

    static associate(model: any) {
        Admin.hasMany(AdminAction, {
            foreignKey: 'admin_id',
            as: 'adminactions'
        });
        AdminAction.belongsTo(Admin, {
            foreignKey: 'admin_id',
            as: 'admins'
        });
    }
}

export default AdminAction;