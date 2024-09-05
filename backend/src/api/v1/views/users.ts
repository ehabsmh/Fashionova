import express from "express"
import UserController from "../controllers/User";

const userRouter = express.Router();
userRouter.post('/auth/register', UserController.register);
userRouter.put('/auth/verify', UserController.verify);
userRouter.put('/auth/resendCode', UserController.resendCode);
userRouter.post('/auth/login', UserController.login);
export default userRouter;
