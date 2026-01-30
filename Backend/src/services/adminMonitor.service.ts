import Bid from '../../models/bid.model.js';
import Diamond from '../../models/diamond.model.js';
import UserBid from '../../models/userBid.model.js';
import User from '../../models/user.model.js';

export class AdminMonitorService {
  static async getAllBidMonitoringData() {
    const bids = await Bid.findAll({
      include: [
        {
          model: Diamond,
          attributes: ['id', 'name', 'image_url', 'base_price'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const result = [];

    for (const bid of bids) {
      const userBids = await UserBid.findAll({
        where: { bid_id: bid.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      let highestBid: any = null;

      for (const ub of userBids) {
        if (
          !highestBid ||
          Number(ub.amount) > Number(highestBid.amount)
        ) {
          highestBid = ub;
        }
      }

      result.push({
        bid_id: bid.id,
        status: bid.status,
        start_time: bid.start_time,
        end_time: bid.end_time,
        base_bid_price: bid.base_bid_price,
        diamond: bid.Diamond
          ? {
              id: bid.Diamond.id,
              name: bid.Diamond.name,
              image_url: bid.Diamond.image_url,
              base_price: bid.Diamond.base_price,
            }
          : null,
        highest_bid: highestBid
          ? {
              amount: highestBid.amount,
              user: (highestBid as any).user
                ? {
                    id: (highestBid as any).user.id,
                    name: (highestBid as any).user.name,
                    email: (highestBid as any).user.email,
                  }
                : null,
            }
          : null,
        all_bids: userBids.map((ub) => ({
          id: ub.id,
          amount: ub.amount,
          user: (ub as any).user
            ? {
                id: (ub as any).user.id,
                name: (ub as any).user.name,
                email: (ub as any).user.email,
              }
            : null,
          created_at: ub.created_at,
        })),
        total_participants: userBids.length,
      });
    }

    return result;
  }
}
