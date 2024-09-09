import { Request, Response } from "express";
import Category from "../../../models/Category";
import ErrorHandler from "../../../utils/ErrorHandler";
import Subcategory from "../../../models/Subcategory";

class SubcategoryController {
  static async add(req: Request, res: Response) {
    const { name, categoryId } = req.body;

    try {
      // Check category existence.
      const category = await Category.findById(categoryId);
      if (!category) throw new ErrorHandler("Category not found.", 404);

      // Check subcategory existence by checking the category id and the category name, means duplicated entry.
      const subcategory = await Subcategory.findOne({ categoryId, name });
      if (subcategory) throw new ErrorHandler("Subcategory already exists.", 400);

      // Create new subcategory.
      const newSubcategory = await Subcategory.create({ categoryId, name, slug: name });
      res.status(201).json({ message: `New subcategory created for ${category.sex}.`, newSubcategory });
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler")
        return res.status(e.statusCode).json({ error: e.message });

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async edit(req: Request, res: Response) {
    const { name, categoryId } = req.body;
    const { subcategoryId } = req.params;

    try {
      // Check category existence.
      const category = await Category.findById(categoryId);
      if (!category) throw new ErrorHandler("Category not found.", 404);

      // Update subcategory.
      const newSubcategory = await Subcategory.findByIdAndUpdate(subcategoryId, { categoryId, name, slug: name });
      res.status(201).json({ message: `${newSubcategory?.name} updated.` });
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler")
        return res.status(e.statusCode).json({ error: e.message });

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async delete(req: Request, res: Response) {
    const { subcategoryId } = req.params;

    try {
      await Subcategory.deleteOne({ _id: subcategoryId });
      res.status(201).json({ message: 'Subcategory deleted.' });
    } catch (e) {
      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async getByCategory(req: Request, res: Response) {
    const { category, sex } = req.query;

    try {
      if (!category && !sex) throw new ErrorHandler("category and sex query params are required", 400);
      if (!category) throw new ErrorHandler("category query param is required", 400);
      if (!sex) throw new ErrorHandler("sex query param is required", 400);

      const isFound = await Category.findOne({ slug: category, sex });
      if (!isFound) throw new ErrorHandler("Category not found.", 404);

      const subcategories = await Subcategory.find({ categoryId: isFound._id });
      if (!subcategories.length) return res.status(404).json({ subcategories });
      res.json({ subcategories });
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler")
        return res.status(e.statusCode).json({ error: e.message });

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }
}

export default SubcategoryController;
