import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IQuiz extends Document {
  articleId: Types.ObjectId;
  question: string;
  options: string[];
  correctAnswer: string; // Must match one of the options
  explanation: string;
  hostileExplanation?: string;
  category: 'Defence' | 'Sports' | 'Awards' | 'Books' | 'Exercises' | 'International Relations';
  createdAt: Date;
}

const QuizSchema: Schema = new Schema({
  articleId: { type: Schema.Types.ObjectId, ref: 'Article', required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: { type: String, required: true },
  hostileExplanation: { type: String },
  category: {
    type: String,
    required: true,
    enum: ['Defence', 'Sports', 'Awards', 'Books', 'Exercises', 'International Relations'] 
  },
  createdAt: { type: Date, default: Date.now },
});

export const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
