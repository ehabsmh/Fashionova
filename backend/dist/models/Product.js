"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    shortDesc: { type: String, required: true },
    longDesc: { type: String },
    sex: { type: String, enum: ['male', 'female'] },
    categoryId: { type: mongoose_1.Types.ObjectId, ref: "Category", required: true },
    subcategoryId: { type: mongoose_1.Types.ObjectId, ref: "Subcategory", required: true },
    slug: {
        type: String, trim: true, lowercase: true,
        set: (v) => v.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g, '-').replace(/[^A-Za-z0-9]+$/g, '')
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });
const Product = (0, mongoose_1.model)('Product', ProductSchema);
exports.default = Product;
