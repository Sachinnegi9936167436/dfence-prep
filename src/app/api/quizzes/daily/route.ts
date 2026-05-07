import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Quiz } from '@/models/Quiz';
import { getSession } from '@/lib/auth';

const ALL_CATEGORIES = ['Defence', 'Sports', 'Awards', 'Books', 'Exercises', 'International Relations'];
const PER_CATEGORY = 4; // Questions per category → 24 total

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.subscriptionStatus !== 'active') {
      return NextResponse.json({ error: 'Subscription required to access tactical drills.' }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    // If a specific category is requested, just return those
    if (category) {
      const quizzes = await Quiz.find({ category })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('articleId', 'title sourceUrl')
        .lean();
      return NextResponse.json({ success: true, quizzes });
    }

    // Otherwise fetch PER_CATEGORY questions from EACH category for a balanced set
    const perCategoryResults = await Promise.all(
      ALL_CATEGORIES.map(cat =>
        Quiz.find({ category: cat })
          .sort({ createdAt: -1 })
          .limit(PER_CATEGORY)
          .populate('articleId', 'title sourceUrl')
          .lean()
      )
    );

    // Flatten all results and shuffle so the order is random
    const combined = perCategoryResults.flat();
    const shuffled = combined.sort(() => Math.random() - 0.5);

    return NextResponse.json({ success: true, quizzes: shuffled });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
