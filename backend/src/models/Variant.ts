import { model, Schema, Types } from "mongoose"

const VariantSchema = new Schema({
    productId: { type: Types.ObjectId, required: true, ref: "Product" },
    color: { type: String, required: true, lowercase: true, unique: true },
    colorCode: { type: String, required: true },
    images: [{ type: String, default: 'no image' }],
    size: { type: String, enum: ['s', 'm', 'l', 'xl', 'xxl'], required: true, unique: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
})


const Variant = model("Variant", VariantSchema);
export default Variant;
