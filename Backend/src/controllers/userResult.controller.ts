import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { UserResultService } from '../services/userResult.service.js';

export const getMyResult = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.userId;
  const { bidId } = req.params as { bidId: string};

  const result =
    await UserResultService.getMyResult(userId, bidId);

  return res.status(200).json({
    data: result,
  });
};

export const getAllMyResults = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.userId;
  console.log('Fetching all results for user:', userId);
  const results = await UserResultService.getAllMyResults(userId);
  console.log('Results fetched:', results); 
  return res.status(200).json({
    data: results,
  });
};
