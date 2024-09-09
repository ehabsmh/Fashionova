"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// interface ProductDocument extends Document {
// }
const SizeSchema = new mongoose_1.Schema({
    size: { type: String, enum: ['s', 'm', 'l', 'xl', 'xxl'], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
});
const VariantSchema = new mongoose_1.Schema({
    color: { type: String, required: true, lowercase: true },
    colorCode: { type: String, required: true },
    images: [{ type: String, default: 'no image' }],
    sizes: [SizeSchema]
});
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    shortDescription: { type: String, required: true },
    longDescription: { type: String },
    categoryId: { type: mongoose_1.Types.ObjectId, ref: "Category" },
    subcategoryId: { type: mongoose_1.Types.ObjectId, ref: "Subcategory" },
    slug: {
        type: String, required: true, trim: true, lowercase: true,
        set: (v) => {
            v.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g, '-').replace(/[^A-Za-z0-9]+$/g, '');
        }
    },
    variants: [VariantSchema],
    sex: { type: String, enum: ['male', 'female', 'unisex'] },
    rating: { type: Number, default: 0, min: 1, max: 5 },
}, { timestamps: true });
const Product = (0, mongoose_1.model)('Product', ProductSchema);
// str1.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g,'-').replace(/[^A-Za-z0-9]+$/g, '')
