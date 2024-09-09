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
const Subcategory_1 = __importDefault(require("./Subcategory"));
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
CategorySchema.pre("deleteOne", { document: true, query: false }, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Subcategory_1.default.deleteMany({ categoryId: this._id });
            next();
        }
        catch (e) {
            next(e);
        }
    });
});
const Category = (0, mongoose_1.model)('Category', CategorySchema);
exports.default = Category;
