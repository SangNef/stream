import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import { UserModelEntity } from '~/type/app.entities';

class User extends Model<UserModelEntity, Optional<UserModelEntity, 'id'>> implements UserModelEntity {
  public id!: number
  public fullname!: string
  public username!: string
  public password!: string
  public avatar!: string | null
  public role!: 'user' | 'creator'
  public coin!: number
  public phone!: string | null
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt?: Date

  static initModel (sequelize: Sequelize) {
    User.init({
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fullname: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      avatar: DataTypes.STRING,
      role: DataTypes.ENUM('creator', 'user'),
      coin: DataTypes.INTEGER,
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'User',
      timestamps: true,
      paranoid: true
    });

    return User;
  }
}

export default User;