import { DataTypes, Model, Optional, Sequelize } from "sequelize";
import { DonateItemEntity } from "~/type/app.entities";

class DonateItemModel extends Model<DonateItemEntity, Optional<DonateItemEntity, 'id'>> implements DonateItemEntity {
    public id!: number
    public name!: string
    public image!: string
    public price!: number
    public readonly createdAt!: Date
    public readonly updatedAt!: Date
    public readonly deletedAt?: Date | null
    
    static initModel (sequelize: Sequelize) {
        DonateItemModel.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    autoIncrement: true,
                    primaryKey: true
                },
                name: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                image: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                price: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false
                }
            },
            {
                sequelize,
                modelName: 'DonateItem',
                timestamps: true,
                paranoid: true
            }
        );
        
        return DonateItemModel;
    }
}

export default DonateItemModel;