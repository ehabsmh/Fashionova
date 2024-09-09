"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubcategorySchema = void 0;
const mongoose_1 = require("mongoose");
// interface ProductDocument extends Document {
// }
exports.SubcategorySchema = new mongoose_1.Schema({
    categoryId: { type: mongoose_1.Types.ObjectId, required: true, ref: "Category" },
    name: { type: String, required: true },
    slug: {
        type: String, required: true, trim: true, lowercase: true,
        set: (v) => {
            v.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g, '-').replace(/[^A-Za-z0-9]+$/g, '');
        }
    },
}, { timestamps: true });
