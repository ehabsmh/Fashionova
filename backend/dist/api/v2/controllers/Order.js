"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../../../models/User"));
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const Order_1 = __importDefault(require("../../../models/Order"));
const Product_1 = __importDefault(require("../../../models/Product"));
class OrderController {
    static createCashOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id } = req.user;
            try {
                // Get user
                const user = yield User_1.default.findById(_id).populate('cart.items');
                if (!user)
                    throw new ErrorHandler_1.default("User not found.", 404);
                const cartItems = user.cart.items;
                if (!cartItems.length)
                    throw new ErrorHandler_1.default("Cart is empty.", 400);
                // Decrease quantity of products
                cartItems.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    const product = yield Product_1.default.findById(item.productId);
                    if (!product)
                        throw new ErrorHandler_1.default("Product not found.", 404);
                    yield product.updateOne({ $inc: { 'variants.$[v].sizes.$[s].quantity': -item.quantity } }, { arrayFilters: [{ 'v.color': item.variant.color }, { 's.size': item.variant.size }] });
                }));
                // Create order
                const { country, city, address, postalCode } = req.body.shippingAddress;
                if (!country)
                    throw new ErrorHandler_1.default("country is required in shippingAddress.", 400);
                if (!city)
                    throw new ErrorHandler_1.default("city is required in shippingAddress.", 400);
                if (!address)
                    throw new ErrorHandler_1.default("address is required in shippingAddress.", 400);
                if (!postalCode)
                    throw new ErrorHandler_1.default("postalCode is required in shippingAddress.", 400);
                const order = yield Order_1.default.create({
                    user: _id,
                    items: cartItems,
                    totalPrice: user.cart.totalPrice,
                    shippingAddress: req.body.shippingAddress
                });
                user.cart.items = [];
                user.cart.totalPrice = 0;
                res.json({ message: "Order created successfully.", order });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    return res.status(500).json({ error: e.message });
            }
        });
    }
    static all(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const orders = yield Order_1.default.find().populate('user', 'email phoneNo1 phoneNo2')
                    .sort({ createdAt: -1 });
                res.json(orders);
            }
            catch (e) {
                if (e instanceof Error)
                    return res.status(500).json({ error: e.message });
            }
        });
    }
    static one(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const order = yield Order_1.default.findOne({ user: req.user._id }).populate('items.productId');
            if (!order)
                return res.status(404).json({ error: "Order not found." });
            res.json(order);
        });
    }
}
exports.default = OrderController;
