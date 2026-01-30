import Bid, { BidStatus } from '../../models/bid.model.js';
import UserBid from '../../models/userBid.model.js';
import Result from '../../models/result.model.js';

export class ResultService {
  static async declareResult(bidId: string) {
    /** 1️⃣ Check bid */
    const bid = await Bid.findByPk(bidId);
    console.log(bid)
    if (!bid) {
      throw new Error('Bid not found');
    }

    /** 2️⃣ End time check */
    const now = new Date();
    if (now < bid.end_time) {
      throw new Error('Cannot declare result before bid end time');
    }

    /** 3️⃣ Check already declared */
    const existingResult = await Result.findOne({
      where: { bid_id: bidId },
    });

    if (existingResult) {
      console.log('Result already declared');
      throw new Error('Result already declared');
    }

    /** 4️⃣ Fetch all user bids */
    const userBids = await UserBid.findAll({
      where: { bid_id: bidId },
    });

    if (userBids.length === 0) {
      console.log('No bids placed for this auction');
      throw new Error('No bids placed for this auction');
    }

    /** 5️⃣ Calculate highest bid */
    let highestBid = userBids[0];

    for (const ub of userBids) {
      if (Number(ub.amount) > Number(highestBid.amount)) {
        highestBid = ub;
      }
    }

    /** 6️⃣ Store result (IMMUTABLE) */
    const result = await Result.create({
      bid_id: bidId,
      winner_user_id: highestBid.user_id,
      winning_amount: highestBid.amount,
    });
    console.log('Result declared successfully', result);
    /** 7️⃣ Close bid */
    bid.status = BidStatus.CLOSED;
    await bid.save();

    return result;
  }
}
