import { Response } from 'express';
import { UserBidService } from '../services/userBid.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const placeOrUpdateBid = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const { bid_id, amount } = req.body;
    console.log(userId,bid_id)
    if (!bid_id || !amount) {
      return res.status(400).json({
        message: 'bid_id and amount are required',
      });
    }

    const result = await UserBidService.placeOrUpdateBid({
      userId,
      bidId: bid_id,
      amount,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getMyBids = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.userId;

  const bids = await UserBidService.getMyBids(userId);

  return res.status(200).json({
    data: bids,
  });
};

export const getBidHistory = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userBidId = req.params.userBidId as string;

    if (!userBidId) {
      return res.status(400).json({
        message: 'userBidId is required',
      });
    }

    const history = await UserBidService.getBidHistory(userBidId);
    return res.status(200).json({
      data: history,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

