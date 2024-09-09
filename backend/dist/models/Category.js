"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true, lowercase: true },
    image: { type: String, default: "no image" },
    slug: {
        type: String, required: true, trim: true, lowercase: true,
        set(v) {
            return v.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g, '-').replace(/[^A-Za-z0-9]+$/g, '');
        },
    },
    sex: { type: String, enum: ['male', 'female'], required: true },
}, { timestamps: true });
const Category = (0, mongoose_1.model)('Category', CategorySchema);
exports.default = Category;
