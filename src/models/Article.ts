import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  content: string;
  category: 'Defence' | 'Sports' | 'Awards' | 'Books' | 'Exercises' | 'International Relations';
  sourceUrl?: string;
  imageUrl?: string;
  publishedAt: Date;
  summary?: string;
  aiProcessed: boolean;
  createdAt: Date;
}

const ArticleSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Defence', 'Sports', 'Awards', 'Books', 'Exercises', 'International Relations']
  },
  sourceUrl: { type: String },
  imageUrl: { type: String },
  publishedAt: { type: Date, required: true },
  summary: { type: String },
  aiProcessed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Avoid duplicate model compilation in Next.js development
export const Article: Model<IArticle> = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);
