import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface BidHistoryAttributes {
  id: string;
  user_bid_id: string;
  old_amount: string;
  new_amount: string;
  edited_at?: Date;
}

interface BidHistoryCreationAttributes
  extends Optional<BidHistoryAttributes, 'id'> {}

class BidHistory
  extends Model<BidHistoryAttributes, BidHistoryCreationAttributes>
  implements BidHistoryAttributes
{
  public id!: string;
  public user_bid_id!: string;
  public old_amount!: string;
  public new_amount!: string;

  public readonly edited_at!: Date;
}

BidHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_bid_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    old_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    new_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    edited_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'bid_history',
    timestamps: false, // IMPORTANT
    underscored: true,
  }
);

export default BidHistory;
