import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import {
  placeOrUpdateBid,
  getMyBids,
  getBidHistory,
} from '../controllers/userBid.controller.js';
import { getMyResult, getAllMyResults } from '../controllers/userResult.controller.js';
import { createUser, getUsers, updateUserStatus } from '../controllers/user.controller.js';
import {
  getActiveBids,
  getActiveBidById,
  getUpcomingBids,
  getRecentlyClosedBids,
} from '../controllers/bid.controller.js';

const router = Router();

// User Management (Admin only)
router.get('/', authenticate, authorize(['ADMIN']), getUsers);
router.post('/', authenticate, authorize(['ADMIN']), createUser);
router.patch('/:id/status', authenticate, authorize(['ADMIN']), updateUserStatus);

// Bid Browsing (Users can view active/upcoming/closed bids)
router.get('/bids/active', authenticate, authorize(['USER']), getActiveBids);
router.get('/bids/upcoming', authenticate, authorize(['USER']), getUpcomingBids);
router.get('/bids/closed', authenticate, authorize(['USER']), getRecentlyClosedBids);
router.get('/bids/active/:bidId', authenticate, authorize(['USER']), getActiveBidById);

// User Bid Management
router.post('/bids', authenticate, authorize(['USER']), placeOrUpdateBid);
router.get('/my-bids', authenticate, authorize(['USER']), getMyBids);
router.get('/bids/:userBidId/history', authenticate, authorize(['USER']), getBidHistory);

// Result Viewing
router.get('/my-results', authenticate, authorize(['USER']), getAllMyResults);
router.get('/bids/:bidId/result', authenticate, authorize(['USER']), getMyResult);

export default router;
