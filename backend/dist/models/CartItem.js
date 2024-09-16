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
const mongoose_1 = require("mongoose");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const Product_1 = __importDefault(require("./Product"));
const CartItemSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Product", required: true },
    variant: {
        color: { type: String },
        size: { type: String }
    },
    quantity: { type: Number, required: true },
    price: { type: Number, default: 0 }
});
CartItemSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const cartItem = this;
        const product = yield Product_1.default.findById(cartItem.productId);
        if (!product)
            throw new ErrorHandler_1.default("Product not found.", 404);
        const variant = product.variants.find((variant) => variant.color === cartItem.variant.color);
        if (!variant)
            throw new ErrorHandler_1.default("Variant not found.", 404);
        const size = variant.sizes.find((size) => size.size === cartItem.variant.size);
        if (!size)
            throw new ErrorHandler_1.default("Size not found.", 404);
        if (size.quantity < cartItem.quantity)
            throw new ErrorHandler_1.default("Not enough quantity.", 400);
        if (size.discountPrice < size.price) {
            this.price = size.discountPrice * this.quantity;
        }
        else {
            this.price = size.price * this.quantity;
        }
        next();
    });
});
const CartItem = (0, mongoose_1.model)("CartItem", CartItemSchema);
exports.default = CartItem;
