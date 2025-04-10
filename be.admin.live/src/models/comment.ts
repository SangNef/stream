import { Model, DataTypes, Optional, Sequelize } from 'sequelize';
import Stream from './stream';
import User from './user';
import { CommentModelEntity } from '~/type/app.entities';

class Comment extends Model<CommentModelEntity, Optional<CommentModelEntity, 'id'>> implements CommentModelEntity {
  public id!: number
  public stream_id!: number
  public user_id!: number
  public content!: string
  public readonly createdAt!: Date
  public readonly updatedAt!: Date
  public readonly deletedAt?: Date

  static initModel (sequelize: Sequelize) {
    Comment.init({
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
      },
      content: DataTypes.STRING
    }, {
      sequelize,
      modelName: 'Comment',
      timestamps: true,
      paranoid: true
    });

    return Comment;
  }

  static associate (model: any) {
    Stream.hasMany(Comment, {
      foreignKey: 'stream_id',
      as: 'comments'
    });
    Comment.belongsTo(Stream, {
      foreignKey: 'stream_id',
      as: 'streams'
    });
    
    User.hasMany(Comment, {
      foreignKey: 'user_id',
      as: 'comments'
    });
    Comment.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'users'
    });
  }
}

export default Comment;