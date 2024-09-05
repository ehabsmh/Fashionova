"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../controllers/User"));
const userRouter = express_1.default.Router();
userRouter.post('/auth/register', User_1.default.register);
userRouter.put('/auth/verify', User_1.default.verify);
userRouter.put('/auth/resendCode', User_1.default.resendCode);
userRouter.post('/auth/login', User_1.default.login);
exports.default = userRouter;
