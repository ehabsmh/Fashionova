"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const Order_1 = __importDefault(require("../controllers/Order"));
const ordersRouter = express_1.default.Router();
/**
 * post: creates a new order with cash payment method.
 * get: gets all orders for the admin.
 */
ordersRouter.post('/orders', auth_1.auth, Order_1.default.createCashOrder)
    .get('/orders', auth_1.adminAuth, Order_1.default.all);
// get: gets user's order.
ordersRouter.get('/orders/one', auth_1.auth, Order_1.default.one);
exports.default = ordersRouter;
