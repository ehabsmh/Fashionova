import { Request, Response } from "express";
import Category from "../../../models/Category";
import cloudinary from "../../../Services/cloudinaryConfig";
import User from "../../../models/User";
import { uploadFileToCloud } from "../../../Services/uploadFile";
import fs from 'fs';
import { fileExist } from "../../../utils/filesHandling";
import ErrorHandler from "../../../utils/ErrorHandler";

export default class CategoryController {
  static async add(req: Request, res: Response) {
    const { name, sex } = req.body;
    const image = req.file;

    try {
      const imagePath = image?.path;
      console.log(name, sex, imagePath);

      const category = await Category.findOne({ name: name.toLowerCase(), sex: sex.toLowerCase() });
      if (category) throw new ErrorHandler(`${name} Category for ${sex} is already exists.`, 409);

      if (!imagePath) {
        const newCategory = await Category.create({ name, slug: name, sex });
        return res.status(201).json({ message: 'Category created successfully.', newCategory });
      }

      const url = await uploadFileToCloud(imagePath, 'categories');

      const newCategory = await Category.create({ name, slug: name, sex, image: url });

      res.status(201).json({ message: 'Category created successfully.', newCategory });
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler")
        return res.status(e.statusCode).json({ error: e.message });

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async edit(req: Request, res: Response) {
    const { name, sex } = req.body;
    const { id } = req.params;
    const image = req.file;

    try {
      // Get the category to edit it.
      const category = await Category.findById(id);
      if (!category) throw new ErrorHandler("Category not found.", 404);

      let url = category.image;

      // Check if there's image to update.
      if (image) {
        // Check if the category has a valid image to get the "folder_name/image_id".
        if (category.image && category.image.startsWith('https://res.cloudinary.com')) {
          const oldImageId = category?.image.split('/').slice(-2).join('/');

          // Remove the image from cloudinary.
          await cloudinary.uploader.destroy(oldImageId);

          // Remove the image from tmp/uploads if exists.
          const imagePath = `${image.destination}${oldImageId.split('/').at(-1)}`;

          if (await fileExist(imagePath)) {
            await fs.promises.unlink(imagePath);
          }
        }

        // Upload the new image to cloudinary.
        url = await uploadFileToCloud(image.path, 'categories');
      }

      // Update category.
      await category.updateOne({ name, slug: name ? name : category.slug, sex, image: url });

      res.json({ message: "Category updated." })
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const category = await Category.findById(id);
      if (!category) throw new ErrorHandler("Category already deleted.", 404);

      if (category.image && category.image.startsWith('https://res.cloudinary.com')) {
        // Check if the category has a valid image to get the "folder_name/image_id".
        const imageId = category?.image.split('/').slice(-2).join('/');

        // Remove the image from cloudinary.
        await cloudinary.uploader.destroy(imageId);

        // Remove the image from tmp/uploads if exists.
        const imagePath = `./backend/tmp/uploads/${imageId.split('/').at(-1)}`;

        if (await fileExist(imagePath)) {
          await fs.promises.unlink(imagePath);
        }
      }

      // Delete Category
      await category.deleteOne();
      res.json({ message: "Category deleted." })
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }

  static async getAllBySex(req: Request, res: Response) {
    const { sex } = req.query;
    try {
      const categories = await Category.find({ sex });
      if (!categories) throw new ErrorHandler("No categories found.", 404);

      res.json({ categories });
    } catch (e) {
      if (e instanceof ErrorHandler && e.name === "ErrorHandler") {
        return res.status(e.statusCode).json({ error: e.message });
      }

      if (e instanceof Error)
        res.status(500).json({ error: e.message })
    }
  }
}
