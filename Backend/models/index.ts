import User from './user.model.js';
import Bid from './bid.model.js';
import UserBid from './userBid.model.js';
import Diamond from './diamond.model.js';
import Result from './result.model.js';

/* User ↔ UserBid */
User.hasMany(UserBid, {
  foreignKey: 'user_id',
});
UserBid.belongsTo(User, {
  as: 'user',
  foreignKey: 'user_id',
});

/* Bid ↔ UserBid */
Bid.hasMany(UserBid, {
  foreignKey: 'bid_id',
});
UserBid.belongsTo(Bid, {
  foreignKey: 'bid_id',
});

/* Diamond ↔ Bid */
Diamond.hasMany(Bid, {
  foreignKey: 'diamond_id',
});
Bid.belongsTo(Diamond, {
  foreignKey: 'diamond_id',
});

/* Bid ↔ Result */
Bid.hasOne(Result, {
  foreignKey: 'bid_id',
});
Result.belongsTo(Bid, {
  foreignKey: 'bid_id',
});

/* User ↔ Result (winner) */
User.hasMany(Result, {
  foreignKey: 'winner_user_id',
});
Result.belongsTo(User, {
  as: 'winner',
  foreignKey: 'winner_user_id',
});
