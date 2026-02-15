import express from 'express';
import {
  placeOrder,
  verifyPayment,
  allOrders,
  userOrders,
  updateStatus,
  testSMS, // ADD THIS
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import authUser from '../middleware/auth.js';

const orderRouter = express.Router();

// Existing routes
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/verify', authUser, verifyPayment);
orderRouter.get('/userorders', authUser, userOrders);
orderRouter.get('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);

// 🧪 Test SMS route (ADD THIS)
orderRouter.get('/test-sms', testSMS);

export default orderRouter;
