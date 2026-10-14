import { Router } from 'express';
import { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist } from '../controllers/wishlist.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.get('/', getWishlist);
router.post('/:productId', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.patch('/:productId/toggle', toggleWishlist);

export default router;
