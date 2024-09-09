import { Schema, model } from "mongoose";
import Subcategory from "./Subcategory";
import { NextFunction } from "express";

const CategorySchema = new Schema({
  name: { type: String, required: true, trim: true, lowercase: true },
  image: { type: String, default: "no image" },
  slug: {
    type: String, required: true, trim: true, lowercase: true,
    set(v: string) {
      return v.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g, '-').replace(/[^A-Za-z0-9]+$/g, '');
    },

  },
  sex: { type: String, enum: ['male', 'female'], required: true },
}, { timestamps: true })

CategorySchema.pre("deleteOne", { document: true, query: false }, async function (next: NextFunction) {
  try {
    await Subcategory.deleteMany({ categoryId: this._id });
    next();
  } catch (e) {
    next(e);
  }
})

const Category = model('Category', CategorySchema);


export default Category;
