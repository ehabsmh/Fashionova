import express from "express"
import UserController from "../controllers/User";

const userRouter = express.Router();
userRouter.post('/auth/register', UserController.register);
export default userRouter;
