import { Schema, Types, model } from "mongoose";

const SizeSchema = new Schema({
  size: { type: String, enum: ['s', 'm', 'l', 'xl', 'xxl'], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
}, { _id: false });

const VariantSchema = new Schema({
  color: { type: String, required: true, lowercase: true, unique: true },
  colorCode: { type: String, required: true },
  images: [{ type: String, default: 'no image' }],
  sizes: [SizeSchema]
}, { _id: false });

const ProductSchema = new Schema({
  name: { type: String, required: true },
  shortDescription: { type: String, required: true },
  longDescription: { type: String },
  categoryId: { type: Types.ObjectId, ref: "Category", required: true },
  subcategoryId: { type: Types.ObjectId, ref: "Subcategory", required: true },
  slug: {
    type: String, trim: true, lowercase: true,
    set: (v: string) =>
      v.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g, '-').replace(/[^A-Za-z0-9]+$/g, '')
  },
  variants: [VariantSchema],
  sex: { type: String, enum: ['male', 'female', 'unisex'] },
  rating: { type: Number, default: 0, min: 1, max: 5 },
}, { timestamps: true })

const Product = model('Product', ProductSchema);
export default Product;

