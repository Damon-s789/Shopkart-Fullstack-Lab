import { Router } from 'express';
import { createPaymentOrder, getOrderById, getOrders, verifyPayment } from '../controllers/order.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);
router.post('/create-payment-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);
router.get('/', getOrders);
router.get('/:id', getOrderById);
export default router;
