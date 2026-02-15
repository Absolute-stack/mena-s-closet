import express from 'express';
import {
  placeOrder,
  verifyPayment,
  allOrders,
  userOrders,
  updateStatus,
} from '../controllers/orderController.js';
import adminAuth from '../middleware/adminAuth.js';
import userAuth from '../middleware/userAuth.js';

const orderRouter = express.Router();

// Admin routes
orderRouter.get('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);

// Order routes - place order doesn't require auth (guest checkout)
orderRouter.post('/place', placeOrder);
orderRouter.post('/verify', verifyPayment);

// User routes - require authentication
orderRouter.post('/userorders', userAuth, userOrders);

export default orderRouter;
