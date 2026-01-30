import { Router } from 'express';
import { getActiveBids } from '../controllers/bid.controller.js';
import { getDiamonds } from '../controllers/diamond.controller.js';

const router = Router();

// Public endpoints - no authentication required
// These are used by the public Home page

// Get active bids for homepage showcase
router.get('/bids/active', getActiveBids);

// Get all diamonds for homepage carousel
router.get('/diamonds', getDiamonds);

export default router;
