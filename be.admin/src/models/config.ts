import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import { ConfigModelEntity } from "~/type/app.entities";

class ConfigModel extends Model<ConfigModelEntity, Optional<ConfigModelEntity, 'id'>> implements ConfigModelEntity {
    public id!: number
    public key!: string
    public value!: string

    static initModel (sequelize: Sequelize) {
        ConfigModel.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                key: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                value: {
                    type: DataTypes.TEXT,
                    allowNull: false
                }
            },
            {
                sequelize,
                modelName: 'Config',
                timestamps: false,
                paranoid: false
            }
        );

        return ConfigModel;
    }
}

export default ConfigModel;