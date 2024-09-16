import { Request, Response } from "express";
import Product from "../../../models/Product";
import ErrorHandler from "../../../utils/ErrorHandler";
import Category from "../../../models/Category";
import { db } from "..";
import mongoose from "mongoose";
import { IVariant } from "../../../interfaces/Product";
import cloudinary from "../../../Services/cloudinaryConfig";
import { fileExist } from "../../../utils/filesHandling";
import fs from 'fs';
import { uploadFileToCloud } from "../../../Services/uploadFile";


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

      // Create new product without images first
      const newProduct = new Product({
        name, slug: name, shortDesc, longDesc, categoryId,
        subcategoryId, variants, sex
      });

      // Check variant color uniqueness
      db.checkVariantsColorUniqueness(newProduct.variants);

      // Add product images.
      await db.addImagesToProduct(req.files as any, newProduct);

      // Save product to the db.
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
      categoryId, subcategoryId, sex
    } = req.body;
    const variants: IVariant[] = req.body.variants
    try {
      if (!productId) throw new ErrorHandler("No request param [product_id] added to the endpoint.", 404);

      if (sex) {
        const category = await Category.findById(categoryId);
        if (category?.sex !== sex) throw new ErrorHandler(`This category doesn't match with ${sex}.`, 400);
      }


      if (variants) db.checkVariantsColorUniqueness(variants);

      await Product.findOneAndUpdate({ _id: productId }, { name, shortDesc, longDesc, categoryId, subcategoryId, sex, variants })

      res.json("Product updated");

    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler")
        return res.status(e.statusCode).json({ error: e.message });

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async delete(req: Request, res: Response) {
    const { productId } = req.params;

    try {
      const isExist = await Product.findById(productId);
      if (!isExist) throw new ErrorHandler("Product not found", 404);

      for (const variant of isExist.variants) {
        for (const image of variant.images) {
          const publicId = image.split('/').slice(-2).join('/');
          await cloudinary.uploader.destroy(publicId);
        }
      }

      await isExist.deleteOne();
      res.json({ message: "Product deleted." });
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler")
        return res.status(e.statusCode).json({ error: e.message });

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async deleteImage(req: Request, res: Response) {
    const { productId, imgId } = req.params;

    try {
      if (!imgId) throw new ErrorHandler("Specify image url to delete.", 400);
      if (!productId) throw new ErrorHandler("[product_id] is required.", 400);
      if (req.headers.variant_index === undefined) throw new ErrorHandler("Specify the [variant_index] in the header.", 400);

      // Get the product
      const product = await Product.findById(productId);
      if (!product) throw new ErrorHandler("No product found.", 404);

      // Get variant
      const variantIndex = Number(req.headers.variant_index);
      const variant = product.variants[variantIndex];


      // Find the image in the specified variant
      const matchImgId = new RegExp(`${imgId}$`);
      const imageFound = variant.images.findIndex((img) => matchImgId.test(img));

      if (imageFound < 0) throw new ErrorHandler("Image not found in the specified variant.", 404);

      // Delete image from the db.
      await product.updateOne({ $pull: { [`variants.${variantIndex}.images`]: matchImgId } });

      // Get images after updating, client will need it to update variant's images.
      const updatedProduct = await Product.findById(productId);
      const updatedImages = updatedProduct?.variants[variantIndex].images;

      // Destroy it from cloudinary
      await cloudinary.uploader.destroy(`products/${imgId}`);


      res.json({ message: "Image deleted successfully.", updatedImages });
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler")
        return res.status(e.statusCode).json({ error: e.message });

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async addImage(req: Request, res: Response) {
    const { productId } = req.params;
    try {
      if (!productId) throw new ErrorHandler("[product_id] is required.", 400);
      if (req.headers.variant_index === undefined) throw new ErrorHandler("Specify the [variant_index] in the header.", 400);

      const variantIndex = Number(req.headers.variant_index);

      const product = await Product.findById(productId);
      if (!product) throw new ErrorHandler("No product found.", 404);

      if (!req.file) throw new ErrorHandler("No image uploaded.", 404);

      const url = await uploadFileToCloud(req.file.path, 'products');
      await product.updateOne({ $push: { [`variants.${variantIndex}.images`]: url } });

      // Get images after updating, client will need it to update variant's images.
      const updatedProduct = await Product.findById(productId);
      const updatedImages = updatedProduct?.variants[variantIndex].images;

      res.json({ message: "Image inserted.", updatedImages });

    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler")
        return res.status(e.statusCode).json({ error: e.message });

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async all(req: Request, res: Response) {
    const products = await Product.find();
    if (!products.length) res.status(404);

    res.json({ products });
  }

  static async by(req: Request, res: Response) {
    const { sex, category, subcategory } = req.query;
    let products = null;
    if (sex && !category && !subcategory) products = await Product.find({ sex });
    if (sex && category && !subcategory) products = await Product.find({ sex, categoryId: category });
    if (sex && category && subcategory) products = await Product.find({ sex, categoryId: category, subcategoryId: subcategory });
    if (!products?.length) res.status(404);

    res.json({ products });
  }

  static async bySlug(req: Request, res: Response) {
    const { slug } = req.params;

    const product = await Product.findOne({ slug });
    if (!product) return res.status(404).json({ error: "Product not found." });

    res.json({ product });
  }
}

export default ProductController;

