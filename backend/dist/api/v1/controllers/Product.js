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
const Product_1 = __importDefault(require("../../../models/Product"));
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const Category_1 = __importDefault(require("../../../models/Category"));
const __1 = require("..");
const mongoose_1 = __importDefault(require("mongoose"));
class ProductController {
    static add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, shortDesc, longDesc, categoryId, subcategoryId, variants, sex } = req.body;
            try {
                // Validate product existence.
                const isExist = yield Product_1.default.findOne({ name });
                if (isExist)
                    throw new ErrorHandler_1.default("Product already exists.", 409);
                // Create new product
                const newProduct = new Product_1.default({
                    name, shortDesc, longDesc, categoryId,
                    subcategoryId, variants, sex
                });
                __1.db.checkVariantsColorUniqueness(newProduct.variants);
                yield newProduct.save();
                res.status(201).json({ message: "New product added.", newProduct });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler")
                    return res.status(e.statusCode).json({ error: e.message });
                if (e instanceof Error) {
                    if (mongoose_1.default.Error.ValidatorError) {
                        return res.status(400).json({ error: e.message.split(':').slice(-1).join('') });
                    }
                    ;
                    res.status(500).json({ error: e.message });
                }
            }
        });
    }
    static edit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { productId } = req.params;
            const { name, shortDesc, longDesc, categoryId, subcategoryId, variants, sex } = req.body;
            try {
                if (!productId)
                    throw new ErrorHandler_1.default("No request param [product_id] added to the endpoint.", 404);
                if (sex) {
                    const category = yield Category_1.default.findById(categoryId);
                    if ((category === null || category === void 0 ? void 0 : category.sex) !== sex)
                        throw new ErrorHandler_1.default(`This category doesn't match with ${sex}.`, 400);
                }
                __1.db.checkVariantsColorUniqueness(variants);
                yield Product_1.default.findOneAndUpdate({ _id: productId }, { name, shortDesc, longDesc, categoryId, subcategoryId, sex, variants });
                res.json("Product updated");
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler")
                    return res.status(e.statusCode).json({ error: e.message });
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
}
exports.default = ProductController;
