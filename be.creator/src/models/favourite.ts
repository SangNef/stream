import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import Stream from './stream';
import User from './user';
import { FavouriteModelEntity } from '~/type/app.entities';

class Favourite extends Model<FavouriteModelEntity, Optional<FavouriteModelEntity, 'id'>> implements FavouriteModelEntity {
  public id!: number
  public stream_id!: number
  public user_id!: number
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt?: Date

  static initModel (sequelize: Sequelize) {
    Favourite.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      stream_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Stream',
          key: 'id'
        }
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'User',
          key: 'id'
        }
      }
    }, {
      sequelize,
      modelName: 'Favourite',
      timestamps: true,
      paranoid: true
    });

    return Stream;
  }

  static associate (model: any) {
    Stream.hasMany(Favourite, {
      foreignKey: 'stream_id',
      as: 'favourites'
    });
    Favourite.belongsTo(Stream, {
      foreignKey: 'stream_id',
      as: 'streams'
    });
    
    User.hasMany(Favourite, {
      foreignKey: 'user_id',
      as: 'favourites'
    });
    Favourite.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'users'
    });
  }
}

export default Favourite;