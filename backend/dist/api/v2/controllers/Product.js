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
const cloudinaryConfig_1 = __importDefault(require("../../../Services/cloudinaryConfig"));
const uploadFile_1 = require("../../../Services/uploadFile");
class ProductController {
    static add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, shortDesc, longDesc, categoryId, subcategoryId, variants, sex } = req.body;
            try {
                // Validate product existence.
                const isExist = yield Product_1.default.findOne({ name });
                if (isExist)
                    throw new ErrorHandler_1.default("Product already exists.", 409);
                // Create new product without images first
                const newProduct = new Product_1.default({
                    name, slug: name, shortDesc, longDesc, categoryId,
                    subcategoryId, variants, sex
                });
                // Check variant color uniqueness
                __1.db.checkVariantsColorUniqueness(newProduct.variants);
                // Add product images.
                yield __1.db.addImagesToProduct(req.files, newProduct);
                // Save product to the db.
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
            const { name, shortDesc, longDesc, categoryId, subcategoryId, sex } = req.body;
            const variants = req.body.variants;
            try {
                if (!productId)
                    throw new ErrorHandler_1.default("No request param [product_id] added to the endpoint.", 404);
                if (sex) {
                    const category = yield Category_1.default.findById(categoryId);
                    if ((category === null || category === void 0 ? void 0 : category.sex) !== sex)
                        throw new ErrorHandler_1.default(`This category doesn't match with ${sex}.`, 400);
                }
                if (variants)
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
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { productId } = req.params;
            try {
                const isExist = yield Product_1.default.findById(productId);
                if (!isExist)
                    throw new ErrorHandler_1.default("Product not found", 404);
                for (const variant of isExist.variants) {
                    for (const image of variant.images) {
                        const publicId = image.split('/').slice(-2).join('/');
                        yield cloudinaryConfig_1.default.uploader.destroy(publicId);
                    }
                }
                yield isExist.deleteOne();
                res.json({ message: "Product deleted." });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler")
                    return res.status(e.statusCode).json({ error: e.message });
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static deleteImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { productId, imgId } = req.params;
            try {
                if (!imgId)
                    throw new ErrorHandler_1.default("Specify image url to delete.", 400);
                if (!productId)
                    throw new ErrorHandler_1.default("[product_id] is required.", 400);
                if (req.headers.variant_index === undefined)
                    throw new ErrorHandler_1.default("Specify the [variant_index] in the header.", 400);
                // Get the product
                const product = yield Product_1.default.findById(productId);
                if (!product)
                    throw new ErrorHandler_1.default("No product found.", 404);
                // Get variant
                const variantIndex = Number(req.headers.variant_index);
                const variant = product.variants[variantIndex];
                // Find the image in the specified variant
                const matchImgId = new RegExp(`${imgId}$`);
                const imageFound = variant.images.findIndex((img) => matchImgId.test(img));
                if (imageFound < 0)
                    throw new ErrorHandler_1.default("Image not found in the specified variant.", 404);
                // Delete image from the db.
                yield product.updateOne({ $pull: { [`variants.${variantIndex}.images`]: matchImgId } });
                // Get images after updating, client will need it to update variant's images.
                const updatedProduct = yield Product_1.default.findById(productId);
                const updatedImages = updatedProduct === null || updatedProduct === void 0 ? void 0 : updatedProduct.variants[variantIndex].images;
                // Destroy it from cloudinary
                yield cloudinaryConfig_1.default.uploader.destroy(`products/${imgId}`);
                res.json({ message: "Image deleted successfully.", updatedImages });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler")
                    return res.status(e.statusCode).json({ error: e.message });
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static addImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { productId } = req.params;
            try {
                if (!productId)
                    throw new ErrorHandler_1.default("[product_id] is required.", 400);
                if (req.headers.variant_index === undefined)
                    throw new ErrorHandler_1.default("Specify the [variant_index] in the header.", 400);
                const variantIndex = Number(req.headers.variant_index);
                const product = yield Product_1.default.findById(productId);
                if (!product)
                    throw new ErrorHandler_1.default("No product found.", 404);
                if (!req.file)
                    throw new ErrorHandler_1.default("No image uploaded.", 404);
                const url = yield (0, uploadFile_1.uploadFileToCloud)(req.file.path, 'products');
                yield product.updateOne({ $push: { [`variants.${variantIndex}.images`]: url } });
                // Get images after updating, client will need it to update variant's images.
                const updatedProduct = yield Product_1.default.findById(productId);
                const updatedImages = updatedProduct === null || updatedProduct === void 0 ? void 0 : updatedProduct.variants[variantIndex].images;
                res.json({ message: "Image inserted.", updatedImages });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler")
                    return res.status(e.statusCode).json({ error: e.message });
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static all(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = parseInt(req.query.page) || 1;
            if (page < 1)
                return res.status(400).json({ error: "Invalid page number." });
            const limit = 15;
            const startIndex = (page - 1) * limit;
            const products = yield Product_1.default.find().skip(startIndex).limit(limit);
            if (!products.length)
                res.status(404);
            res.json({ products });
        });
    }
    static by(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sex, category, subcategory } = req.query;
            let products = null;
            if (sex && !category && !subcategory)
                products = yield Product_1.default.find({ sex });
            if (sex && category && !subcategory)
                products = yield Product_1.default.find({ sex, categoryId: category });
            if (sex && category && subcategory)
                products = yield Product_1.default.find({ sex, categoryId: category, subcategoryId: subcategory });
            if (!(products === null || products === void 0 ? void 0 : products.length))
                res.status(404);
            res.json({ products });
        });
    }
    static bySlug(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { slug } = req.params;
            const product = yield Product_1.default.findOne({ slug });
            if (!product)
                return res.status(404).json({ error: "Product not found." });
            res.json({ product });
        });
    }
}
exports.default = ProductController;
