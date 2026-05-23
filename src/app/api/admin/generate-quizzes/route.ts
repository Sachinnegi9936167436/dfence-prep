import { NextResponse } from 'next/server';
import { generateNewQuizzes } from '@/lib/quiz-generator';

export async function GET() {
  try {
    const count = await generateNewQuizzes();
    return NextResponse.json({ 
      success: true, 
      message: `Successfully generated ${count} fresh quizzes from news articles.` 
    });
  } catch (error: unknown) {
    console.error('Generation Tool Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}
