import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import User from "./user";
import Stream from "./stream";
import { FollowerModelEntity } from "~/type/app.entities";

class Follower extends Model<FollowerModelEntity, Optional<FollowerModelEntity, 'id'>> implements FollowerModelEntity {
    public id!: number
    public user_id!: number
    public follower_id!: number
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
    public readonly deletedAt?: Date | null

    static initModel (sequelize: Sequelize) {
        Follower.init(
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
                    }
                },
                follower_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: User,
                        key: 'id'
                    }
                }
            },
            {
                sequelize,
                modelName: 'Follower',
                timestamps: true,
                paranoid: true
            }
        );

        return Follower;
    }

    static associate (model: any) {
        User.hasMany(Follower, {
            foreignKey: 'user_id',
            as: 'followers'
        });
        Follower.belongsTo(User, {
            foreignKey: 'user_id',
            as: 'users'
        });
        
        User.hasMany(Follower, {
            foreignKey: 'follower_id',
            as: 'followers_fl'
        });
        Follower.belongsTo(User, {
            foreignKey: 'follower_id',
            as: 'users_fl'
        });
        
        Stream.hasMany(Follower, {
            foreignKey: 'user_id',
            as: 'followers'
        });
        Follower.belongsTo(Stream, {
            foreignKey: 'user_id',
            as: 'streams'
        });
    }
}

export default Follower;