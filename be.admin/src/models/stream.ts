import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import User from './user';
import { StreamModelEntity, StreamStatus } from '~/type/app.entities';

class Stream extends Model<StreamModelEntity, Optional<StreamModelEntity, 'id'>> implements StreamModelEntity {
  public id!: number
  public user_id!: number
  public thumbnail!: string
  public stream_url!: string
  public title!: string
  public view!: number
  public status!: StreamStatus
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt?: Date

  static initModel (sequelize: Sequelize) {
    Stream.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id'
        }
      },
      thumbnail: {
        type: DataTypes.STRING,
        allowNull: true
      },
      stream_url: DataTypes.STRING,
      title: DataTypes.STRING,
      view: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: DataTypes.ENUM(...Object.values(StreamStatus))
    }, {
      sequelize,
      modelName: 'Stream',
      timestamps: true,
      paranoid: true
    });

    return Stream;
  }

  static associate (model: any) {
    User.hasMany(Stream, {
      foreignKey: 'user_id',
      as: 'streams'
    });
    Stream.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'users'
    });
  }
}

export default Stream;