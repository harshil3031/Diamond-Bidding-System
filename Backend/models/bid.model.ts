import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database.js';
import Diamond from './diamond.model.js';
export enum BidStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
}

interface BidAttributes {
  id: string;
  diamond_id: string;
  base_bid_price: string;
  start_time: Date;
  end_time: Date;
  status: BidStatus;
  created_at?: Date;
  updated_at?: Date;
}

interface BidCreationAttributes
  extends Optional<BidAttributes, 'id' | 'status'> {}

class Bid
  extends Model<BidAttributes, BidCreationAttributes>
  implements BidAttributes
{
  public id!: string;
  public diamond_id!: string;
  public base_bid_price!: string;
  public start_time!: Date;
  public end_time!: Date;
  public status!: BidStatus;

  public Diamond?: Diamond;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Bid.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    diamond_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    base_bid_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(BidStatus)),
      allowNull: false,
      defaultValue: BidStatus.DRAFT,
    },
  },
  {
    sequelize,
    tableName: 'bids',
    underscored: true,
  }
);
Bid.belongsTo(Diamond, {
  foreignKey: 'diamond_id',
});

Diamond.hasMany(Bid, {
  foreignKey: 'diamond_id',
});
export default Bid;
