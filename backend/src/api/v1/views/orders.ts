import express from "express"
import { adminAuth, auth } from "../middlewares/auth";
import OrderController from "../controllers/Order";

const ordersRouter = express.Router();
/**
 * post: creates a new order with cash payment method.
 * get: gets all orders for the admin.
 */
ordersRouter.post('/orders', auth, OrderController.createCashOrder)
    .get('/orders', adminAuth, OrderController.all);

// get: gets user's order.
ordersRouter.get('/orders/one', auth, OrderController.one);
export default ordersRouter;
