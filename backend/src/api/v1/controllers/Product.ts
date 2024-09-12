import { Request, Response } from "express";
import Product from "../../../models/Product";
import ErrorHandler from "../../../utils/ErrorHandler";
import Category from "../../../models/Category";
import { db } from "..";
import mongoose from "mongoose";


class ProductController {
  static async add(req: Request, res: Response) {
    const {
      name, shortDesc, longDesc,
      categoryId, subcategoryId, variants, sex
    } = req.body;

    try {
      // Validate product existence.
      const isExist = await Product.findOne({ name });
      if (isExist) throw new ErrorHandler("Product already exists.", 409);

      // Create new product
      const newProduct = new Product({
        name, shortDesc, longDesc, categoryId,
        subcategoryId, variants, sex
      });

      db.checkVariantsColorUniqueness(newProduct.variants);
      await newProduct.save();

      res.status(201).json({ message: "New product added.", newProduct });

    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler")
        return res.status(e.statusCode).json({ error: e.message });
      if (e instanceof Error) {
        if (mongoose.Error.ValidatorError) {
          return res.status(400).json({ error: e.message.split(':').slice(-1).join('') })
        };
        res.status(500).json({ error: e.message })
      }
    }
  }

  static async edit(req: Request, res: Response) {
    const { productId } = req.params;

    const {
      name, shortDesc, longDesc,
      categoryId, subcategoryId, variants, sex
    } = req.body;

    try {
      if (!productId) throw new ErrorHandler("No request param [product_id] added to the endpoint.", 404);

      if (sex) {
        const category = await Category.findById(categoryId);
        if (category?.sex !== sex) throw new ErrorHandler(`This category doesn't match with ${sex}.`, 400);
      }

      db.checkVariantsColorUniqueness(variants);
      await Product.findOneAndUpdate({ _id: productId }, { name, shortDesc, longDesc, categoryId, subcategoryId, sex, variants })

      res.json("Product updated");

    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler")
        return res.status(e.statusCode).json({ error: e.message });

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }
}

export default ProductController;
