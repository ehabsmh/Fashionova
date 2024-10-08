import { Schema, model } from "mongoose";
import ErrorHandler from "../utils/ErrorHandler";
import IProduct, { IVariant } from "../interfaces/Product";

type Size = {
  size: string;
  quantity: number;
  price: number;
  discountPrice: number;
};

const SizeSchema = new Schema({
  size: { type: String, enum: ['s', 'm', 'l', 'xl', 'xxl'], required: true, unique: true, immutable: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
}, { _id: false });

export const VariantSchema = new Schema<IVariant>({
  color: { type: String, required: true, lowercase: true },
  colorCode: { type: String, required: true },
  images: [{ type: String, default: 'no image' }],
  sizes: {
    type: [SizeSchema],
    validate: {
      validator: (sizes: Size[]) => {
        const sizeSet = new Set(sizes.map(s => s.size));
        return sizeSet.size === sizes.length;
      },
      message: 'Sizes must be unique for each color variant.',
      name: 'sizes',
    }
  }
}, { _id: false });


export const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, unique: true },
  shortDesc: { type: String, required: true },
  longDesc: { type: String },
  sex: { type: String, enum: ['male', 'female'] },
  categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  subcategoryId: { type: Schema.Types.ObjectId, ref: "Subcategory", required: true },
  slug: {
    type: String, trim: true, lowercase: true,
    set: (v: string) =>
      v.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g, '-').replace(/[^A-Za-z0-9]+$/g, '')
  },
  variants: { type: [VariantSchema], required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true })

ProductSchema.pre("findOneAndUpdate", async function (next) {
  const updatedProduct = this._update;

  if (updatedProduct.variants) {
    updatedProduct.variants.forEach((variant: IVariant) => {
      const sizeSet = new Set(variant.sizes.map(s => s.size));
      if (sizeSet.size !== variant.sizes.length) throw new ErrorHandler("Sizes must be unique for each color variant.", 400);
    })
  }
  next();
})


const Product = model('Product', ProductSchema);
export default Product;

