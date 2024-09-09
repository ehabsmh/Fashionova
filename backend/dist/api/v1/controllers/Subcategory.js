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
                const category = yield Category_1.default.findById(categoryId);
                if (!category)
                    throw new ErrorHandler_1.default("Category not found.", 404);
                const newSubcategory = yield Subcategory_1.default.create({ name: name.toLowerCase(), slug: name, categoryId });
                res.status(201).json({ message: "New subcategory created.", newSubcategory });
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
exports.default = SubcategoryController;
