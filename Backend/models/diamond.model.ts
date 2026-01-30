import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
interface DiamondAttributes {
  id: string;
  name: string;
  image_url?: string | null;
  base_price: string;
  created_at?: Date;
  updated_at?: Date;
}

interface DiamondCreationAttributes
  extends Optional<DiamondAttributes, 'id' | 'image_url'> {}

class Diamond
  extends Model<DiamondAttributes, DiamondCreationAttributes>
  implements DiamondAttributes
{
  public id!: string;
  public name!: string;
  public image_url!: string | null;
  public base_price!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Diamond.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    base_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'diamonds',
    underscored: true,
  }
);
export default Diamond;
