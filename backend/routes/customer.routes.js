import { Router } from 'express';
import { changePassword, getMe, login, logout, register } from '../controllers/customer.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.post('/logout', requireAuth, logout);
router.patch('/change-password', requireAuth, changePassword);

export default router;
