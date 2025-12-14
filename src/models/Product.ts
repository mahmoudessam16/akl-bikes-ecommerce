import 'server-only';
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductVariant {
  id: string;
  name_ar: string;
  name_en?: string;
  price_modifier?: number;
  stock: number;
  attributes: Record<string, string | number>;
}

export interface IProductColor {
  id: string;
  name_ar: string;
  name_en?: string;
  image: string;
  stock: number;
  available: boolean;
}

export interface IProduct extends Document {
  id: string;
  sku: string;
  title_ar: string;
  title_en?: string;
  slug: string;
  price: number;
  stock: number;
  primary_category: string;
  images: string[];
  attributes: Record<string, string | number>;
  description_ar?: string;
  description_en?: string;
  variants?: IProductVariant[];
  colors?: IProductColor[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  id: { type: String, required: true },
  name_ar: { type: String, required: true },
  name_en: { type: String },
  price_modifier: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  attributes: { type: Schema.Types.Mixed, default: {} },
});

const ProductColorSchema = new Schema<IProductColor>({
  id: { type: String, required: true },
  name_ar: { type: String, required: true },
  name_en: { type: String },
  image: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  available: { type: Boolean, required: true, default: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    title_ar: {
      type: String,
      required: true,
    },
    title_en: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    primary_category: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    description_ar: {
      type: String,
    },
    description_en: {
      type: String,
    },
    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    colors: {
      type: [ProductColorSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
ProductSchema.index({ primary_category: 1 });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;

