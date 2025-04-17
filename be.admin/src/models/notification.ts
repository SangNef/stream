import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import User from './user';
import { NotiModelEntity } from '~/type/app.entities';

class Notification extends Model<NotiModelEntity, Optional<NotiModelEntity, 'id'>> implements NotiModelEntity {
  public id!: number
  public user_id!: number
  public type!: 'live' | 'coin'
  public title!: string
  public content!: string
  public is_read!: boolean
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt?: Date

  static initModel (sequelize: Sequelize) {
    Notification.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'User',
          key: 'id'
        }
      },
      type: DataTypes.ENUM('live', 'coin'),
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      is_read: DataTypes.BOOLEAN
    }, {
      sequelize,
      modelName: 'Notification',
      timestamps: true,
      paranoid: true
    });

    return Notification;
  }

  static associate (model: any) {
    User.hasMany(Notification, {
      foreignKey: 'user_id',
      as: 'notifications'
    });
    Notification.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'users'
    });
  }
}

export default Notification;