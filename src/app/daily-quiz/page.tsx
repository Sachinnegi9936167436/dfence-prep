import connectToDatabase from '@/lib/mongoose';
import { Quiz } from '@/models/Quiz';
import QuizClient from './QuizClient';

export const dynamic = 'force-dynamic';

export default async function DailyQuizPage() {
  await connectToDatabase();

  return (
    <div className="max-w-3xl mx-auto py-8 relative">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10" style={{ animationDelay: '2s' }}></div>
      <div className="relative z-10">
        <QuizClient />
      </div>
    </div>
  );
}
