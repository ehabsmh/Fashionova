"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OrderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
            productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
            variant: {
                color: { type: String },
                size: { type: String }
            },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }],
    totalPrice: { type: Number, required: true },
    shippingAddress: {
        country: { type: String, required: true },
        city: { type: String, required: true },
        address: { type: String, required: true },
        postalCode: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ['cash', 'card'], required: true, default: 'cash' },
    status: {
        type: String,
        enum: [
            'Pending', 'Processing', 'Shipped', 'In Transit',
            'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'
        ],
        default: 'Pending'
    }
});
OrderSchema.virtual('product', {
    ref: 'Product',
    localField: 'items.productId',
    foreignField: '_id'
});
const Order = (0, mongoose_1.model)('Order', OrderSchema);
exports.default = Order;
