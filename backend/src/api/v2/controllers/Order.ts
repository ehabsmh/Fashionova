import { Request, Response } from "express";
import User from "../../../models/User";
import ErrorHandler from "../../../utils/ErrorHandler";
import CartItem, { ICartItem } from "../../../models/CartItem";
import Order from "../../../models/Order";
import Product from "../../../models/Product";

class OrderController {
  static async createCashOrder(req: Request, res: Response) {
    const { _id } = (req as any).user;
    try {
      // Get user
      const user = await User.findById(_id).populate('cart.items');
      if (!user) throw new ErrorHandler("User not found.", 404);

      const cartItems = <ICartItem[]><unknown>user.cart.items;
      if (!cartItems.length) throw new ErrorHandler("Cart is empty.", 400);

      // Decrease quantity of products
      cartItems.forEach(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new ErrorHandler("Product not found.", 404);

        await product.updateOne({ $inc: { 'variants.$[v].sizes.$[s].quantity': -item.quantity } }, { arrayFilters: [{ 'v.color': item.variant.color }, { 's.size': item.variant.size }] });
      });

      // Create order
      const { country, city, address, postalCode } = req.body.shippingAddress;
      if (!country) throw new ErrorHandler("country is required in shippingAddress.", 400);
      if (!city) throw new ErrorHandler("city is required in shippingAddress.", 400);
      if (!address) throw new ErrorHandler("address is required in shippingAddress.", 400);
      if (!postalCode) throw new ErrorHandler("postalCode is required in shippingAddress.", 400);

      const order = await Order.create({
        user: _id,
        items: cartItems,
        totalPrice: user.cart.totalPrice,
        shippingAddress: req.body.shippingAddress
      });

      user.cart.items = [];
      user.cart.totalPrice = 0;

      res.json({ message: "Order created successfully.", order });

    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error) return res.status(500).json({ error: e.message })
    }
  }

  static async all(req: Request, res: Response) {
    try {
      const orders = await Order.find().populate('user', 'email phoneNo1 phoneNo2')
        .sort({ createdAt: -1 });

      res.json(orders);
    } catch (e) {
      if (e instanceof Error) return res.status(500).json({ error: e.message });
    }
  }

  static async one(req: Request, res: Response) {
    const order = await Order.findOne({ user: (req as any).user._id }).populate('items.productId');
    if (!order) return res.status(404).json({ error: "Order not found." });
    res.json(order);
  }
}

export default OrderController;
