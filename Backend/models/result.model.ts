import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface ResultAttributes {
  id: string;
  bid_id: string;
  winner_user_id: string;
  winning_amount: string;
  declared_at?: Date;
}

interface ResultCreationAttributes
  extends Optional<ResultAttributes, 'id'> {}

class Result
  extends Model<ResultAttributes, ResultCreationAttributes>
  implements ResultAttributes
{
  public id!: string;
  public bid_id!: string;
  public winner_user_id!: string;
  public winning_amount!: string;

  public readonly declared_at!: Date;
}

Result.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    bid_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    winner_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    winning_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    declared_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'results',
    timestamps: false, // IMMUTABLE TABLE
    underscored: true,
  }
);

export default Result;
