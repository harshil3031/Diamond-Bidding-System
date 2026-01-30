import Result from '../../models/result.model.js';
import Bid from '../../models/bid.model.js';
import Diamond from '../../models/diamond.model.js';
import User from '../../models/user.model.js';

export class UserResultService {
  static async getMyResult(userId: string, bidId: string) {
    const result = await Result.findOne({
      where: { bid_id: bidId },
      include: [
        {
          model: Bid,
          include: [
            {
              model: Diamond,
              attributes: ['id', 'name', 'image_url'],
            },
          ],
        },
        {
          model: User,
          as: 'winner',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!result) {
      return null;
    }

    const isWinner = result.winner_user_id === userId;

    return {
      status: isWinner ? 'WIN' : 'LOSE',
      winning_amount: result.winning_amount,
      bid_id: bidId,
      bid: (result as any).Bid
        ? {
            id: (result as any).Bid.id,
            base_bid_price: (result as any).Bid.base_bid_price,
            diamond: (result as any).Bid.Diamond || null,
          }
        : null,
      winner: (result as any).winner
        ? {
            name: (result as any).winner.name,
          }
        : null,
    };
  }

  static async getAllMyResults(userId: string) {
    const results = await Result.findAll({
      include: [
        {
          model: Bid,
          required: true,
          include: [
            {
              model: Diamond,
              attributes: ['id', 'name', 'image_url'],
            },
          ],
        },
        {
          model: User,
          as: 'winner',
          attributes: ['id', 'name'],
        },
      ],
    });

    // Filter to show only results where user participated
    // We need to check if user has a UserBid for this bid
    const UserBid = (await import('../../models/userBid.model.js')).default;
    
    const userBids = await UserBid.findAll({
      where: { user_id: userId },
      attributes: ['bid_id'],
    });
    
    const userBidIds = new Set(userBids.map(ub => ub.bid_id));

    const userResults = results
      .filter(result => userBidIds.has(result.bid_id))
      .map((result) => {
        const isWinner = result.winner_user_id === userId;
        return {
          bid_id: result.bid_id,
          status: isWinner ? 'WIN' : 'LOSE',
          winning_amount: result.winning_amount,
          bid: (result as any).Bid
            ? {
                id: (result as any).Bid.id,
                base_bid_price: (result as any).Bid.base_bid_price,
                diamond: (result as any).Bid.Diamond || null,
              }
            : null,
          winner: (result as any).winner
            ? {
                name: (result as any).winner.name,
              }
            : null,
        };
      });

    return userResults;
  }
}
