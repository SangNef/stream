import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { AdminModelEntity, AdminRole } from '~/type/app.entities';

class Admin extends Model<AdminModelEntity, Optional<AdminModelEntity, 'id'>> implements AdminModelEntity {
  public id!: number
  public name!: string
  public email!: string
  public password!: string
  public role!: AdminRole;
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt!: Date | null

  static initModel(sequelize: Sequelize) {
    Admin.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        role: {
          type: DataTypes.ENUM(...Object.values(AdminRole)),
          allowNull: false,
          defaultValue: 'admin'
        },
      },
      {
        sequelize,
        modelName: 'Admin',
        timestamps: true,
        paranoid: true
      }
    );
    return Admin;
  }
}

export default Admin;