export interface SizeInterface {
    size: 's' | 'm' | 'l' | 'xl' | 'xxl';
    quantity: number;
    price: number;
    discountPrice?: number;
};
export interface VariantInterface extends SizeInterface {
    color: string;
    colorCode: string;
    images?: string[];
    sizes: SizeInterface[];
};

export default interface ProductInterface extends VariantInterface {
    name: string;
    shortDesc: string;
    longDesc: string;
    categoryId: string;
    subcategoryId: string;
    variants: VariantInterface[];
    sex: 'male' | 'female';
};
