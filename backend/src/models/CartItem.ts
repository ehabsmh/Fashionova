import { model, Schema, Types } from "mongoose";
import ErrorHandler from "../utils/ErrorHandler";
import Product from "./Product";
import User from "./User";

export interface ICartItem {
    productId: Types.ObjectId;
    variant: {
        color: string;
        size: string;
    };
    quantity: number;
    price: number;
}

const CartItemSchema = new Schema<ICartItem>({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: {
        color: { type: String },
        size: { type: String },
    },
    quantity: { type: Number, required: true },
    price: { type: Number, default: 0 }
});

CartItemSchema.pre("save", async function (next) {
    const cartItem = this;
    const product = await Product.findById(cartItem.productId);
    if (!product) throw new ErrorHandler("Product not found.", 404);

    const variant = product.variants.find((variant) => variant.color === cartItem.variant.color);
    if (!variant) throw new ErrorHandler("Variant not found.", 404);

    const size = variant.sizes.find((size) => size.size === cartItem.variant.size);
    if (!size) throw new ErrorHandler("Size not found.", 404);
    if (size.quantity < cartItem.quantity) throw new ErrorHandler("Not enough quantity.", 400);

    if (size.discountPrice < size.price) {
        this.price = size.discountPrice * this.quantity;
    } else {
        this.price = size.price * this.quantity;
    }

    next();
});

const CartItem = model("CartItem", CartItemSchema);

export default CartItem;
