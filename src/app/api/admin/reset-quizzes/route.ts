import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Quiz } from '@/models/Quiz';
import { Article } from '@/models/Article';
import { getSession } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Delete ALL quizzes so they get regenerated fresh
    const deletedQuizzes = await Quiz.deleteMany({});

    // Reset aiProcessed on all articles so they get re-queued for quiz generation
    const resetArticles = await Article.updateMany({}, { aiProcessed: false });

    return NextResponse.json({
      success: true,
      message: `Cleared ${deletedQuizzes.deletedCount} quizzes. Reset ${resetArticles.modifiedCount} articles. Now click "Fetch Latest News & Generate Quizzes" to regenerate.`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
