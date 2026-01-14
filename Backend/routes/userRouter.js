import express from 'express';
import {
  registerUser,
  loginUser,
  loginAdmin,
  verifyUser,
  userLogout,
  getUserData,
} from '../controllers/usersController.js';
import loginLimiter from '../middleware/limiter.js';
const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginLimiter, loginUser);
userRouter.post('/admin', loginAdmin);
userRouter.get('/verify', verifyUser);
userRouter.post('/logout', userLogout);
userRouter.get('/me', getUserData);
export default userRouter;
