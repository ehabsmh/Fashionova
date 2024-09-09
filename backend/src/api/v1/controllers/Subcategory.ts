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

      // Create new subcategory.
      const newSubcategory = await Subcategory.create({ categoryId, name, slug: name });
      res.status(201).json({ message: "New subcategory created.", newSubcategory });
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

  }
}

export default SubcategoryController;
