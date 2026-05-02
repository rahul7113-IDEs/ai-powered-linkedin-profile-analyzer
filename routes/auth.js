import express from 'express';
import * as authController from '../controllers/auth.js';
import * as authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.use(authMiddleware.protect);

router.get('/me', authController.getMe);
router.patch('/updateMe', authController.updateMe);
router.patch('/updatePassword', authController.updatePassword);
router.delete('/deleteMe', authController.deleteMe);

export default router;
