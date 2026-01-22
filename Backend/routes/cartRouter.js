import express from 'express';
import {
  addToCart,
  updateCart,
  getUserCart,
  clearCart,
  syncCart,
} from '../controllers/cartController.js';
import userAuth from '../middleware/userAuth.js';

const cartRouter = express.Router();

cartRouter.post('/add', userAuth, addToCart);
cartRouter.post('/update', userAuth, updateCart);
cartRouter.post('/get', userAuth, getUserCart);
cartRouter.post('/clear', userAuth, clearCart);
cartRouter.post('/sync', userAuth, syncCart);

export default cartRouter;
