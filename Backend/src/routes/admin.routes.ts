import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/role.middleware.js';
import { getBidMonitoring } from '../controllers/adminMonitor.controller.js';
import { createDiamond, getDiamonds, updateDiamond } from '../controllers/diamond.controller.js';
import {
  createBid,
  getBids,
  getBidById,
  updateBid,
  deleteBid,
  getBidsByStatus,
  activateBid,
  closeBid,
  getBidStatistics,
} from '../controllers/bid.controller.js';
import { declareResult } from '../controllers/result.controller.js';

const router = Router();

// Diamond Management
router.post('/diamonds', authenticate, authorize(['ADMIN']), createDiamond);
router.get('/diamonds', authenticate, authorize(['ADMIN']), getDiamonds);
router.put('/diamonds/:id', authenticate, authorize(['ADMIN']), updateDiamond);

// Bid Management
router.post('/bids', authenticate, authorize(['ADMIN']), createBid);
router.get('/bids', authenticate, authorize(['ADMIN']), getBids);
router.get('/bids/status', authenticate, authorize(['ADMIN']), getBidsByStatus);
router.get('/bids/:bidId', authenticate, authorize(['ADMIN']), getBidById);
router.put('/bids/:bidId', authenticate, authorize(['ADMIN']), updateBid);
router.delete('/bids/:bidId', authenticate, authorize(['ADMIN']), deleteBid);

// Bid Actions
router.post('/bids/:bidId/activate', authenticate, authorize(['ADMIN']), activateBid);
router.post('/bids/:bidId/close', authenticate, authorize(['ADMIN']), closeBid);

// Bid Statistics & Monitoring
router.get('/bids/:bidId/statistics', authenticate, authorize(['ADMIN']), getBidStatistics);
router.get('/monitor/bids', authenticate, authorize(['ADMIN']), getBidMonitoring);

// Result Declaration
router.post('/bids/:bidId/declare-result', authenticate, authorize(['ADMIN']), declareResult);

export default router;
