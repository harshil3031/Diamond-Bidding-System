import Bid, { BidStatus } from '../../models/bid.model.js';
import Diamond from '../../models/diamond.model.js';
import UserBid from '../../models/userBid.model.js';
import Result from '../../models/result.model.js';
import { Op } from 'sequelize';

export class BidService {
  /**
   * Create a new bid for a diamond
   */
  static async createBid(data: {
    diamond_id: string;
    base_bid_price: string;
    start_time: Date;
    end_time: Date;
  }) {
    // Validate time range
    const now = new Date();
    if (data.start_time >= data.end_time) {
      throw new Error('Start time must be before end time');
    }

    if (data.end_time <= now) {
      throw new Error('End time must be in the future');
    }

    // Validate diamond exists
    const diamond = await Diamond.findByPk(data.diamond_id);
    if (!diamond) {
      throw new Error('Diamond not found');
    }

    // Validate base bid price
    const baseBidPrice = parseFloat(data.base_bid_price);
    if (isNaN(baseBidPrice) || baseBidPrice <= 0) {
      throw new Error('Base bid price must be a positive number');
    }

    // Check if diamond already has an active or pending bid
    const existingBid = await Bid.findOne({
      where: {
        diamond_id: data.diamond_id,
        status: {
          [Op.in]: [BidStatus.DRAFT, BidStatus.ACTIVE],
        },
      },
    });

    if (existingBid) {
      throw new Error('Diamond already has an active or pending bid');
    }

    // Determine initial status based on start time
    const status = data.start_time <= now ? BidStatus.ACTIVE : BidStatus.DRAFT;

    const bid = await Bid.create({
      diamond_id: data.diamond_id,
      base_bid_price: data.base_bid_price,
      start_time: data.start_time,
      end_time: data.end_time,
      status: status,
    });

    // Return bid with diamond details
    return Bid.findByPk(bid.id, {
      include: [
        {
          model: Diamond,
          attributes: ['id', 'name', 'image_url', 'base_price'],
        },
      ],
    });
  }

  /**
   * Get all bids with their diamond details and statistics
   */
  static async getAllBids() {
    // Sync statuses before fetching
    await this.syncBidStatuses();

    const bids = await Bid.findAll({
      include: [
        {
          model: Diamond,
          attributes: ['id', 'name', 'image_url', 'base_price'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    // Enrich each bid with statistics
    const enrichedBids = await Promise.all(
      bids.map(async (bid) => {
        const [stats, result] = await Promise.all([
          this.getBidStatistics(bid.id),
          Result.findOne({ where: { bid_id: bid.id } }),
        ]);
        return {
          id: bid.id,
          diamond_id: bid.diamond_id,
          base_bid_price: bid.base_bid_price,
          start_time: bid.start_time,
          end_time: bid.end_time,
          status: bid.status,
          created_at: bid.created_at,
          updated_at: bid.updated_at,
          diamond: bid.Diamond,
          statistics: stats,
          result_declared: !!result,
        };
      })
    );

    return enrichedBids;
  }

  /**
   * Get a single bid by ID with details
   */
  static async getBidById(bidId: string) {
    const bid = await Bid.findByPk(bidId, {
      include: [
        {
          model: Diamond,
          attributes: ['id', 'name', 'image_url', 'base_price'],
        },
      ],
    });

    if (!bid) {
      throw new Error('Bid not found');
    }

    const [stats, result] = await Promise.all([
      this.getBidStatistics(bidId),
      Result.findOne({ where: { bid_id: bidId } }),
    ]);

    return {
      ...bid.toJSON(),
      statistics: stats,
      result_declared: !!result,
    };
  }

  /**
   * Update bid details (only for DRAFT bids)
   */
  static async updateBid(
    bidId: string,
    data: {
      base_bid_price?: string;
      start_time?: Date;
      end_time?: Date;
    }
  ) {
    const bid = await Bid.findByPk(bidId);

    if (!bid) {
      throw new Error('Bid not found');
    }

    if (bid.status !== BidStatus.DRAFT) {
      throw new Error('Can only update bids in DRAFT status');
    }

    // Validate time range if provided
    const startTime = data.start_time || bid.start_time;
    const endTime = data.end_time || bid.end_time;

    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }

    // Update bid
    await bid.update({
      base_bid_price: data.base_bid_price || bid.base_bid_price,
      start_time: startTime,
      end_time: endTime,
    });

    return Bid.findByPk(bidId, {
      include: [{ model: Diamond }],
    });
  }

  /**
   * Delete a bid (only DRAFT bids without any user bids)
   */
  static async deleteBid(bidId: string) {
    const bid = await Bid.findByPk(bidId);

    if (!bid) {
      throw new Error('Bid not found');
    }

    if (bid.status !== BidStatus.DRAFT) {
      throw new Error('Can only delete bids in DRAFT status');
    }

    // Check if any users have placed bids
    const userBidCount = await UserBid.count({
      where: { bid_id: bidId },
    });

    if (userBidCount > 0) {
      throw new Error('Cannot delete bid with existing user bids');
    }

    await bid.destroy();
    return { message: 'Bid deleted successfully' };
  }

  /**
   * Get statistics for a specific bid
   */
  static async getBidStatistics(bidId: string) {
    const userBids = await UserBid.findAll({
      where: { bid_id: bidId },
      attributes: ['amount'],
    });

    const totalParticipants = userBids.length;
    const amounts = userBids.map((ub) => parseFloat(ub.amount));

    return {
      total_participants: totalParticipants,
      highest_bid: totalParticipants > 0 ? Math.max(...amounts) : 0,
      lowest_bid: totalParticipants > 0 ? Math.min(...amounts) : 0,
      average_bid:
        totalParticipants > 0
          ? amounts.reduce((a, b) => a + b, 0) / totalParticipants
          : 0,
    };
  }

  /**
   * Sync bid statuses based on current time
   */
  static async syncBidStatuses() {
    const now = new Date();

    // DRAFT -> ACTIVE when start_time is reached
    await Bid.update(
      { status: BidStatus.ACTIVE },
      {
        where: {
          status: BidStatus.DRAFT,
          start_time: { [Op.lte]: now },
        },
      }
    );

    // ACTIVE -> CLOSED when end_time is passed
    await Bid.update(
      { status: BidStatus.CLOSED },
      {
        where: {
          status: BidStatus.ACTIVE,
          end_time: { [Op.lte]: now },
        },
      }
    );
  }

  /**
   * Get bids filtered by status
   */
  static async getBidsByStatus(status: BidStatus) {
    await this.syncBidStatuses();

    return Bid.findAll({
      where: { status },
      include: [
        {
          model: Diamond,
          attributes: ['id', 'name', 'image_url', 'base_price'],
        },
      ],
      order: [['start_time', 'ASC']],
    });
  }

  /**
   * Manually activate a DRAFT bid (admin action)
   */
  static async activateBid(bidId: string) {
    const bid = await Bid.findByPk(bidId);

    if (!bid) {
      throw new Error('Bid not found');
    }

    if (bid.status !== BidStatus.DRAFT) {
      throw new Error('Only DRAFT bids can be activated');
    }

    const now = new Date();
    if (bid.end_time <= now) {
      throw new Error('Cannot activate bid that has already ended');
    }

    await bid.update({ status: BidStatus.ACTIVE });

    return Bid.findByPk(bidId, {
      include: [{ model: Diamond }],
    });
  }

  /**
   * Manually close a bid (admin action)
   */
  static async closeBid(bidId: string) {
    const bid = await Bid.findByPk(bidId);

    if (!bid) {
      throw new Error('Bid not found');
    }

    if (bid.status === BidStatus.CLOSED) {
      throw new Error('Bid is already closed');
    }

    await bid.update({ status: BidStatus.CLOSED });

    return Bid.findByPk(bidId, {
      include: [{ model: Diamond }],
    });
  }
}

/**
 * Service for handling active bids (user-facing)
 */
export class ActiveBidService {
  /**
   * Sync bid statuses based on time
   */
  static async syncStatuses() {
    const now = new Date();

    // DRAFT -> ACTIVE when start_time reached
    await Bid.update(
      { status: BidStatus.ACTIVE },
      {
        where: {
          status: BidStatus.DRAFT,
          start_time: { [Op.lte]: now },
        },
      }
    );

    // ACTIVE -> CLOSED when end_time passed
    await Bid.update(
      { status: BidStatus.CLOSED },
      {
        where: {
          status: BidStatus.ACTIVE,
          end_time: { [Op.lte]: now },
        },
      }
    );
  }

  /**
   * Get all currently active bids (for users to participate in)
   */
  static async getActiveBids() {
    await this.syncStatuses();
    const now = new Date();

    const bids = await Bid.findAll({
      where: {
        status: BidStatus.ACTIVE,
        start_time: { [Op.lte]: now },
        end_time: { [Op.gt]: now },
      },
      include: [
        {
          model: Diamond,
          attributes: ['id', 'name', 'image_url', 'base_price'],
        },
      ],
      order: [['end_time', 'ASC']],
    });

    // Add time remaining and statistics for each bid
    const enrichedBids = await Promise.all(
      bids.map(async (bid) => {
        const stats = await BidService.getBidStatistics(bid.id);
        const timeRemaining = bid.end_time.getTime() - now.getTime();

        return {
          ...bid.toJSON(),
          time_remaining_ms: Math.max(0, timeRemaining),
          statistics: stats,
        };
      })
    );

    return enrichedBids;
  }

  /**
   * Get a specific active bid by ID
   */
  static async getActiveBidById(bidId: string) {
    await this.syncStatuses();
    const now = new Date();

    const bid = await Bid.findOne({
      where: {
        id: bidId,
        status: BidStatus.ACTIVE,
        start_time: { [Op.lte]: now },
        end_time: { [Op.gt]: now },
      },
      include: [
        {
          model: Diamond,
          attributes: ['id', 'name', 'image_url', 'base_price'],
        },
      ],
    });

    if (!bid) {
      throw new Error('Active bid not found');
    }

    const stats = await BidService.getBidStatistics(bidId);
    const timeRemaining = bid.end_time.getTime() - now.getTime();

    return {
      ...bid.toJSON(),
      time_remaining_ms: Math.max(0, timeRemaining),
      statistics: stats,
    };
  }

  /**
   * Check if a bid is currently active and accepting bids
   */
  static async isBidActive(bidId: string): Promise<boolean> {
    await this.syncStatuses();
    const now = new Date();

    const bid = await Bid.findOne({
      where: {
        id: bidId,
        status: BidStatus.ACTIVE,
        start_time: { [Op.lte]: now },
        end_time: { [Op.gt]: now },
      },
    });

    return !!bid;
  }

  /**
   * Get upcoming bids (DRAFT status but start time is in future)
   */
  static async getUpcomingBids() {
    await this.syncStatuses();
    const now = new Date();

    return Bid.findAll({
      where: {
        status: BidStatus.DRAFT,
        start_time: { [Op.gt]: now },
      },
      include: [
        {
          model: Diamond,
          attributes: ['id', 'name', 'image_url', 'base_price'],
        },
      ],
      order: [['start_time', 'ASC']],
    });
  }

  /**
   * Get recently closed bids
   */
  static async getRecentlyClosedBids(limit: number = 10) {
    await this.syncStatuses();

    return Bid.findAll({
      where: {
        status: BidStatus.CLOSED,
      },
      include: [
        {
          model: Diamond,
          attributes: ['id', 'name', 'image_url', 'base_price'],
        },
      ],
      order: [['end_time', 'DESC']],
      limit,
    });
  }
}