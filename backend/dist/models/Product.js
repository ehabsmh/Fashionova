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
exports.ProductSchema = exports.VariantSchema = void 0;
const mongoose_1 = require("mongoose");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const SizeSchema = new mongoose_1.Schema({
    size: { type: String, enum: ['s', 'm', 'l', 'xl', 'xxl'], required: true, unique: true, immutable: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
}, { _id: false });
exports.VariantSchema = new mongoose_1.Schema({
    color: { type: String, required: true, lowercase: true },
    colorCode: { type: String, required: true },
    images: [{ type: String, default: 'no image' }],
    sizes: {
        type: [SizeSchema],
        validate: {
            validator: (sizes) => {
                const sizeSet = new Set(sizes.map(s => s.size));
                return sizeSet.size === sizes.length;
            },
            message: 'Sizes must be unique for each color variant.',
            name: 'sizes',
        }
    }
}, { _id: false });
exports.ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    shortDesc: { type: String, required: true },
    longDesc: { type: String },
    sex: { type: String, enum: ['male', 'female'] },
    categoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    subcategoryId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Subcategory", required: true },
    slug: {
        type: String, trim: true, lowercase: true,
        set: (v) => v.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g, '-').replace(/[^A-Za-z0-9]+$/g, '')
    },
    variants: { type: [exports.VariantSchema], required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });
exports.ProductSchema.pre("findOneAndUpdate", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatedProduct = this._update;
        if (updatedProduct.variants) {
            updatedProduct.variants.forEach((variant) => {
                const sizeSet = new Set(variant.sizes.map(s => s.size));
                if (sizeSet.size !== variant.sizes.length)
                    throw new ErrorHandler_1.default("Sizes must be unique for each color variant.", 400);
            });
        }
        next();
    });
});
const Product = (0, mongoose_1.model)('Product', exports.ProductSchema);
exports.default = Product;
