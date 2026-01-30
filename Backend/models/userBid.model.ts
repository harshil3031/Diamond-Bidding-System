import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';

interface UserBidAttributes {
  id: string;
  user_id: string;
  bid_id: string;
  amount: string;
  created_at?: Date;
  updated_at?: Date;
}

interface UserBidCreationAttributes
  extends Optional<UserBidAttributes, 'id'> {}

class UserBid
  extends Model<UserBidAttributes, UserBidCreationAttributes>
  implements UserBidAttributes
{
  public id!: string;
  public user_id!: string;
  public bid_id!: string;
  public amount!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

UserBid.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    bid_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'user_bids',
    underscored: true,
  }
);

export default UserBid;
