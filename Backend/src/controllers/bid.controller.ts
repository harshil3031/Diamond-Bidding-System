import { Request, Response } from 'express';
import { BidService, ActiveBidService } from '../services/bid.service.js';
import { BidStatus } from '../../models/bid.model.js';

/**
 * Create a new bid (Admin only)
 */
export const createBid = async (req: Request, res: Response) => {
  try {
    const { diamond_id, base_bid_price, start_time, end_time } = req.body;

    // Validate required fields
    if (!diamond_id || !base_bid_price || !start_time || !end_time) {
      return res.status(400).json({
        message: 'All fields are required: diamond_id, base_bid_price, start_time, end_time',
      });
    }

    const bid = await BidService.createBid({
      diamond_id,
      base_bid_price,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    });

    return res.status(201).json({
      message: 'Bid created successfully',
      data: bid,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || 'Failed to create bid',
    });
  }
};

/**
 * Get all bids with statistics (Admin only)
 */
export const getBids = async (_req: Request, res: Response) => {
  try {
    const bids = await BidService.getAllBids();

    return res.status(200).json({
      message: 'Bids retrieved successfully',
      data: bids,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || 'Failed to retrieve bids',
    });
  }
};

/**
 * Get a single bid by ID (Admin only)
 */
export const getBidById = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;

    if (!bidId) {
      return res.status(400).json({
        message: 'Bid ID is required',
      });
    }

    const bid = await BidService.getBidById(bidId as string);

    return res.status(200).json({
      message: 'Bid retrieved successfully',
      data: bid,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: error.message || 'Bid not found',
    });
  }
};

/**
 * Update a bid (Admin only - only for DRAFT bids)
 */
export const updateBid = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;
    const { base_bid_price, start_time, end_time } = req.body;

    if (!bidId) {
      return res.status(400).json({
        message: 'Bid ID is required',
      });
    }

    const updateData: any = {};
    if (base_bid_price) updateData.base_bid_price = base_bid_price;
    if (start_time) updateData.start_time = new Date(start_time);
    if (end_time) updateData.end_time = new Date(end_time);

    const bid = await BidService.updateBid(bidId as string, updateData);

    return res.status(200).json({
      message: 'Bid updated successfully',
      data: bid,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || 'Failed to update bid',
    });
  }
};

/**
 * Delete a bid (Admin only - only for DRAFT bids with no user bids)
 */
export const deleteBid = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;

    if (!bidId) {
      return res.status(400).json({
        message: 'Bid ID is required',
      });
    }

    const result = await BidService.deleteBid(bidId as string);

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || 'Failed to delete bid',
    });
  }
};

/**
 * Get bids by status (Admin only)
 */
export const getBidsByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    if (!status || !Object.values(BidStatus).includes(status as BidStatus)) {
      return res.status(400).json({
        message: 'Valid status is required (DRAFT, ACTIVE, or CLOSED)',
      });
    }

    const bids = await BidService.getBidsByStatus(status as BidStatus);

    return res.status(200).json({
      message: `${status} bids retrieved successfully`,
      data: bids,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || 'Failed to retrieve bids',
    });
  }
};

/**
 * Manually activate a DRAFT bid (Admin only)
 */
export const activateBid = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;

    if (!bidId) {
      return res.status(400).json({
        message: 'Bid ID is required',
      });
    }

    const bid = await BidService.activateBid(bidId as string);

    return res.status(200).json({
      message: 'Bid activated successfully',
      data: bid,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || 'Failed to activate bid',
    });
  }
};

/**
 * Manually close a bid (Admin only)
 */
export const closeBid = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;

    if (!bidId) {
      return res.status(400).json({
        message: 'Bid ID is required',
      });
    }

    const bid = await BidService.closeBid(bidId as string);

    return res.status(200).json({
      message: 'Bid closed successfully',
      data: bid,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || 'Failed to close bid',
    });
  }
};

/**
 * Get bid statistics (Admin only)
 */
export const getBidStatistics = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;

    if (!bidId) {
      return res.status(400).json({
        message: 'Bid ID is required',
      });
    }

    const stats = await BidService.getBidStatistics(bidId as string);

    return res.status(200).json({
      message: 'Statistics retrieved successfully',
      data: stats,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || 'Failed to retrieve statistics',
    });
  }
};

// ========== USER-FACING ENDPOINTS ==========

/**
 * Get all active bids (User)
 */
export const getActiveBids = async (_req: Request, res: Response) => {
  try {
    const bids = await ActiveBidService.getActiveBids();

    return res.status(200).json({
      message: 'Active bids retrieved successfully',
      data: bids,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || 'Failed to retrieve active bids',
    });
  }
};

/**
 * Get a specific active bid (User)
 */
export const getActiveBidById = async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;

    if (!bidId) {
      return res.status(400).json({
        message: 'Bid ID is required',
      });
    }

    const bid = await ActiveBidService.getActiveBidById(bidId as string);

    return res.status(200).json({
      message: 'Active bid retrieved successfully',
      data: bid,
    });
  } catch (error: any) {
    return res.status(404).json({
      message: error.message || 'Active bid not found',
    });
  }
};

/**
 * Get upcoming bids (User)
 */
export const getUpcomingBids = async (_req: Request, res: Response) => {
  try {
    const bids = await ActiveBidService.getUpcomingBids();

    return res.status(200).json({
      message: 'Upcoming bids retrieved successfully',
      data: bids,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || 'Failed to retrieve upcoming bids',
    });
  }
};

/**
 * Get recently closed bids (User)
 */
export const getRecentlyClosedBids = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const bids = await ActiveBidService.getRecentlyClosedBids(limit);

    return res.status(200).json({
      message: 'Recently closed bids retrieved successfully',
      data: bids,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || 'Failed to retrieve closed bids',
    });
  }
};

