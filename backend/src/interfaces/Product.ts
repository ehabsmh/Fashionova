import mongoose, { Types } from "mongoose";
import { ProductSchema } from "../models/Product";

export interface ISize {
    size: string;
    quantity: number;
    price: number;
    discountPrice: number;
}

export interface IVariant {
    color: string;
    colorCode: string;
    images: string[];
    sizes: ISize[];
};

export default interface IProduct {
    name: string;
    shortDesc: string;
    longDesc?: string;
    sex?: 'male' | 'female';
    categoryId: Types.ObjectId;
    subcategoryId: Types.ObjectId;
    slug?: string;
    variants: IVariant[];
    rating?: number;
};
