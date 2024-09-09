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
const ErrorHandler_1 = __importDefault(require("../../../utils/ErrorHandler"));
const Subcategory_1 = __importDefault(require("../../../models/Subcategory"));
class SubcategoryController {
    static add(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, categoryId } = req.body;
            try {
                // Check category existence.
                const category = yield Category_1.default.findById(categoryId);
                if (!category)
                    throw new ErrorHandler_1.default("Category not found.", 404);
                // Check subcategory existence by checking the category id and the category name, means duplicated entry.
                const subcategory = yield Subcategory_1.default.findOne({ categoryId, name });
                if (subcategory)
                    throw new ErrorHandler_1.default("Subcategory already exists.", 400);
                // Create new subcategory.
                const newSubcategory = yield Subcategory_1.default.create({ categoryId, name, slug: name });
                res.status(201).json({ message: `New subcategory created for ${category.sex}.`, newSubcategory });
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
            const { name, categoryId } = req.body;
            const { subcategoryId } = req.params;
            try {
                // Check category existence.
                const category = yield Category_1.default.findById(categoryId);
                if (!category)
                    throw new ErrorHandler_1.default("Category not found.", 404);
                // Update subcategory.
                const newSubcategory = yield Subcategory_1.default.findByIdAndUpdate(subcategoryId, { categoryId, name, slug: name });
                res.status(201).json({ message: `${newSubcategory === null || newSubcategory === void 0 ? void 0 : newSubcategory.name} updated.` });
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
            const { subcategoryId } = req.params;
            try {
                yield Subcategory_1.default.deleteOne({ _id: subcategoryId });
                res.status(201).json({ message: 'Subcategory deleted.' });
            }
            catch (e) {
                if (e instanceof Error)
                    res.status(500).json({ error: e.message });
            }
        });
    }
    static getByCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { category, sex } = req.query;
            try {
                if (!category && !sex)
                    throw new ErrorHandler_1.default("category and sex query params are required", 400);
                if (!category)
                    throw new ErrorHandler_1.default("category query param is required", 400);
                if (!sex)
                    throw new ErrorHandler_1.default("sex query param is required", 400);
                const isFound = yield Category_1.default.findOne({ slug: category, sex });
                if (!isFound)
                    throw new ErrorHandler_1.default("Category not found.", 404);
                const subcategories = yield Subcategory_1.default.find({ categoryId: isFound._id });
                if (!subcategories.length)
                    return res.status(404).json({ subcategories });
                res.json({ subcategories });
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
exports.default = SubcategoryController;
