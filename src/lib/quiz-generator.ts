import { Article } from '@/models/Article';
import { Quiz } from '@/models/Quiz';
import { generateMCQsFromText } from './openai';
import connectToDatabase from './mongoose';

export async function generateNewQuizzes() {
  await connectToDatabase();
  
  // 1. Clear old quizzes (Optional, but good for fresh start)
  await Quiz.deleteMany({});
  
  const categories: ('Defence' | 'Sports' | 'Awards' | 'Books' | 'Exercises' | 'International Relations')[] = ['Defence', 'Sports', 'Awards', 'Books', 'Exercises', 'International Relations'];
  let totalGenerated = 0;

  for (const category of categories) {
    // 2. Get latest 3 articles for each category
    const articles = await Article.find({ category })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();

    for (const article of articles) {
      // 3. Generate 3 MCQs for each article
      const mcqs = await generateMCQsFromText(article.content, category);
      
      const quizzesToSave = mcqs.map(m => ({
        ...m,
        category,
        articleId: article._id,
        createdAt: new Date()
      }));

      if (quizzesToSave.length > 0) {
        await Quiz.insertMany(quizzesToSave);
        totalGenerated += quizzesToSave.length;
      }
    }
  }

  return totalGenerated;
}
