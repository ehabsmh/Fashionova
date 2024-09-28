import express from "express"
import UserController from "../controllers/User";
import { auth } from './../middlewares/auth';

const userRouter = express.Router();
userRouter.post('/auth/register', UserController.register);
userRouter.put('/auth/verify', UserController.verify);
userRouter.put('/auth/resendCode', UserController.resendCode);
userRouter.post('/auth/login', UserController.login);
userRouter.post('/user/addToCart', auth, UserController.addToCart);
userRouter.delete('/user/deleteFromCart/:cartItemId', auth, UserController.deleteFromCart);
userRouter.get('/user/getCart', auth, UserController.getCart);
export default userRouter;
