import { Request, Response } from 'express';
import { ResultService } from '../services/result.service.js';

export const declareResult = async (
  req: Request,
  res: Response
) => {
  try {
    const { bidId } = req.params as { bidId: string };;

    const result = await ResultService.declareResult(bidId);

    return res.status(200).json({
      message: 'Result declared successfully',
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
