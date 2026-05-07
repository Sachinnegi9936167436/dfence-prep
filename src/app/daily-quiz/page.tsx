import connectToDatabase from '@/lib/mongoose';
import { Quiz } from '@/models/Quiz';
import QuizClient from './QuizClient';
import { getSession } from '@/lib/auth';
import SubscriptionShield from '@/components/SubscriptionShield';

export const dynamic = 'force-dynamic';

export default async function DailyQuizPage() {
  await connectToDatabase();
  const session = await getSession();

  return (
    <div className="max-w-4xl mx-auto py-12 relative min-h-[80vh]">
      <div className="absolute inset-0 subtle-grid opacity-20 -z-10"></div>
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float -z-10" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float -z-10" style={{ animationDelay: '2s' }}></div>
      <div className="relative z-10">
        <SubscriptionShield 
          subscriptionStatus={session?.subscriptionStatus || 'inactive'} 
          title="Tactical Drill Zone Restricted" 
          description="Daily assessment drills and AI-powered question analysis are reserved for active Elite subscribers."
        >
          <div className="glass-panel p-8 rounded-[2.5rem]">
            <QuizClient />
          </div>
        </SubscriptionShield>
      </div>
    </div>
  );
}
