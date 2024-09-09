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
const Category_1 = __importDefault(require("../../../models/Category"));
const cloudinaryConfig_1 = __importDefault(require("../../../Services/cloudinaryConfig"));
const uploadFile_1 = require("../../../Services/uploadFile");
const fs_1 = __importDefault(require("fs"));
const filesHandling_1 = require("../../../utils/filesHandling");
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
class CategoryController {
    static add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, sex } = req.body;
            const image = req.file;
            try {
                const imagePath = image === null || image === void 0 ? void 0 : image.path;
                console.log(name, sex, imagePath);
                const category = yield Category_1.default.findOne({ name: name.toLowerCase(), sex: sex.toLowerCase() });
                if (category)
                    throw new ErrorHandler_1.default(`${name} Category for ${sex} is already exists.`, 409);
                if (!imagePath) {
                    const newCategory = yield Category_1.default.create({ name, slug: name, sex });
                    return res.status(201).json({ message: 'Category created successfully.', newCategory });
                }
                const url = yield (0, uploadFile_1.uploadFileToCloud)(imagePath, 'categories');
                const newCategory = yield Category_1.default.create({ name, slug: name, sex, image: url });
                res.status(201).json({ message: 'Category created successfully.', newCategory });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler")
                    return res.status(e.statusCode).json({ error: e.message });
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static edit(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, sex } = req.body;
            const { id } = req.params;
            const image = req.file;
            try {
                // Get the category to edit it.
                const category = yield Category_1.default.findById(id);
                if (!category)
                    throw new ErrorHandler_1.default("Category not found.", 404);
                let url = category.image;
                // Check if there's image to update.
                if (image) {
                    // Check if the category has a valid image to get the "folder_name/image_id".
                    if (category.image && category.image.startsWith('https://res.cloudinary.com')) {
                        const oldImageId = category === null || category === void 0 ? void 0 : category.image.split('/').slice(-2).join('/');
                        // Remove the image from cloudinary.
                        yield cloudinaryConfig_1.default.uploader.destroy(oldImageId);
                        // Remove the image from tmp/uploads if exists.
                        const imagePath = `${image.destination}${oldImageId.split('/').at(-1)}`;
                        if (yield (0, filesHandling_1.fileExist)(imagePath)) {
                            yield fs_1.default.promises.unlink(imagePath);
                        }
                    }
                    // Upload the new image to cloudinary.
                    url = yield (0, uploadFile_1.uploadFileToCloud)(image.path, 'categories');
                }
                // Update category.
                yield category.updateOne({ name, slug: name ? name : category.slug, sex, image: url });
                res.json({ message: "Category updated." });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const category = yield Category_1.default.findById(id);
                if (!category)
                    throw new ErrorHandler_1.default("Category already deleted.", 404);
                if (category.image && category.image.startsWith('https://res.cloudinary.com')) {
                    // Check if the category has a valid image to get the "folder_name/image_id".
                    const imageId = category === null || category === void 0 ? void 0 : category.image.split('/').slice(-2).join('/');
                    // Remove the image from cloudinary.
                    yield cloudinaryConfig_1.default.uploader.destroy(imageId);
                    // Remove the image from tmp/uploads if exists.
                    const imagePath = `./backend/tmp/uploads/${imageId.split('/').at(-1)}`;
                    if (yield (0, filesHandling_1.fileExist)(imagePath)) {
                        yield fs_1.default.promises.unlink(imagePath);
                    }
                }
                // Delete Category
                yield category.deleteOne();
                res.json({ message: "Category deleted." });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static getBySex(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sex } = req.query;
            try {
                const categories = yield Category_1.default.find({ sex });
                if (!categories)
                    throw new ErrorHandler_1.default("No categories found.", 404);
                res.json({ categories });
            }
            catch (e) {
                if (e instanceof ErrorHandler_1.default && e.name === "ErrorHandler") {
                    return res.status(e.statusCode).json({ error: e.message });
                }
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
}
exports.default = CategoryController;
