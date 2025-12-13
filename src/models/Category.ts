import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  parentId: string | null;
  image?: string;
  description_ar?: string;
  description_en?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name_ar: {
      type: String,
      required: true,
    },
    name_en: {
      type: String,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    parentId: {
      type: String,
      default: null,
    },
    image: {
      type: String,
    },
    description_ar: {
      type: String,
    },
    description_en: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster parent-child lookups
CategorySchema.index({ parentId: 1 });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;

