import Bid, { BidStatus } from '../../models/bid.model.js';
import UserBid from '../../models/userBid.model.js';
import BidHistory from '../../models/bidHistory.model.js';
import User from '../../models/user.model.js';
import Diamond from '../../models/diamond.model.js';

export class UserBidService {
  static async placeOrUpdateBid(params: {
    userId: string;
    bidId: string;
    amount: string;
  }) {
    const { userId, bidId, amount } = params;

    /** 1️⃣ Check user */
    const user = await User.findByPk(userId);
    if (!user || !user.is_active) {
      throw new Error('User is not allowed to bid');
    }

    /** 2️⃣ Check bid */
    const bid = await Bid.findByPk(bidId);
    if (!bid) {
      throw new Error('Bid not found');
    }

    /** 3️⃣ Status check */
    if (bid.status !== BidStatus.ACTIVE) {
      throw new Error('Bidding is not active');
    }

    /** 4️⃣ Time window check */
    const now = new Date();
    if (now < bid.start_time || now > bid.end_time) {
      throw new Error('Bidding window is closed');
    }

    /** 5️⃣ Base bid price check */
    if (Number(amount) < Number(bid.base_bid_price)) {
      throw new Error(`Bid amount must be at least ₹${bid.base_bid_price}`);
    }

    /** 6️⃣ Check if user already has a bid */
    const existingBid = await UserBid.findOne({
      where: { user_id: userId, bid_id: bidId },
    });

    // 🔹 FIRST TIME BID
    if (!existingBid) {
      const userBid = await UserBid.create({
        user_id: userId,
        bid_id: bidId,
        amount,
      });

      return {
        message: 'Bid placed successfully',
        data: userBid,
      };
    }

    // 🔹 UPDATE BID (EDIT)
    const oldAmount = existingBid.amount;

    if (Number(amount) <= Number(oldAmount)) {
      throw new Error(`New bid amount must be greater than your current bid of ₹${oldAmount}`);
    }

    existingBid.amount = amount;
    await existingBid.save();

    // 🔹 Save history
    await BidHistory.create({
      user_bid_id: existingBid.id,
      old_amount: oldAmount,
      new_amount: amount,
    });

    return {
      message: 'Bid updated successfully',
      data: existingBid,
    };
  }

  static async getMyBids(userId: string) {
    const userBids = await UserBid.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Bid,
          include: [
            {
              model: Diamond,
              attributes: ['id', 'name', 'image_url', 'base_price'],
            },
          ],
        },
      ],
      order: [['updated_at', 'DESC']],
    });

    return userBids.map((ub) => ({
      id: ub.id,
      user_id: ub.user_id,
      bid_id: ub.bid_id,
      amount: ub.amount,
      created_at: ub.created_at,
      updated_at: ub.updated_at,
      bid: (ub as any).Bid
        ? {
            id: (ub as any).Bid.id,
            status: (ub as any).Bid.status,
            base_bid_price: (ub as any).Bid.base_bid_price,
            start_time: (ub as any).Bid.start_time,
            end_time: (ub as any).Bid.end_time,
            diamond: (ub as any).Bid.Diamond || null,
          }
        : null,
    }));
  }

  static async getBidHistory(userBidId: string) {
    return BidHistory.findAll({
      where: { user_bid_id: userBidId },
      order: [['edited_at', 'DESC']],
    });
  }
}
