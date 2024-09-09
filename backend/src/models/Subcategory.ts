import { Schema, Types, model } from "mongoose";

export const SubcategorySchema = new Schema({
    categoryId: { type: Types.ObjectId, required: true, ref: "Category" },
    name: { type: String, required: true, trim: true, lowercase: true },
    slug: {
        type: String, required: true, trim: true, lowercase: true,
        set: (v: string) => {
            v.replace(/\s+/g, "-").replace(/[^A-Za-z0-9]+/g, '-').replace(/[^A-Za-z0-9]+$/g, '');
        }
    },
}, { timestamps: true })

const Subcategory = model('Subcategory', SubcategorySchema);
export default Subcategory;
