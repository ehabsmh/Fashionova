import { Request, Response } from "express";
import Category from "../../../models/Category";
import ErrorHandler from "../../../utils/ErrorHandler";
import Subcategory from "../../../models/Subcategory";

class SubcategoryController {
  static async add(req: Request, res: Response) {
    const { name, categoryId } = req.body;

    try {
      const category = await Category.findById(categoryId);
      if (!category) throw new ErrorHandler("Category not found.", 404);

      const newSubcategory = await Subcategory.create({ name: name.toLowerCase(), slug: name, categoryId });

      res.status(201).json({ message: "New subcategory created.", newSubcategory });
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }
}

export default SubcategoryController;
