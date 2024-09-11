"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VariantSchema = new mongoose_1.Schema({
    productId: { type: mongoose_1.Types.ObjectId, required: true, ref: "Product" },
    color: { type: String, required: true, lowercase: true },
    colorCode: { type: String, required: true },
    images: [{ type: String, default: 'no image' }],
    size: { type: String, enum: ['s', 'm', 'l', 'xl', 'xxl'], required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
});
const Variant = (0, mongoose_1.model)("Variant", VariantSchema);
exports.default = Variant;
