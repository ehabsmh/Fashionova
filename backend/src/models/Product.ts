import { Schema, Types, model } from "mongoose";

const ProductSchema = new Schema({
  name: { type: String, required: true, unique: true },
  shortDesc: { type: String, required: true },
  longDesc: { type: String },
  sex: { type: String, enum: ['male', 'female'] },
  categoryId: { type: Types.ObjectId, ref: "Category", required: true },
  subcategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
  slug: {
    type: String, trim: true, lowercase: true,
    set: (v: string) =>
      v.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g, '-').replace(/[^A-Za-z0-9]+$/g, '')
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true })

const Product = model('Product', ProductSchema);
export default Product;

