import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const RANKS = [
  { name: 'Cadet', min: 0, max: 50, icon: 'Shield' },
  { name: 'Lieutenant Candidate', min: 51, max: 200, icon: 'Award' },
  { name: 'Lieutenant', min: 201, max: 500, icon: 'Medal' },
  { name: 'Captain', min: 501, max: 1000, icon: 'Star' },
  { name: 'Major', min: 1001, max: Infinity, icon: 'Trophy' }
];

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentScore = user.score || 0;
    const currentRank = RANKS.find(r => currentScore >= r.min && currentScore <= r.max) || RANKS[0];
    const nextRankIndex = RANKS.findIndex(r => r.name === currentRank.name) + 1;
    const nextRank = RANKS[nextRankIndex] || null;

    let progress = 0;
    if (nextRank) {
      const range = nextRank.min - currentRank.min;
      const progressInRange = currentScore - currentRank.min;
      progress = Math.min(Math.round((progressInRange / range) * 100), 100);
    } else {
      progress = 100;
    }

    // AI-Driven Field Report logic
    let fieldReport = "Operational status excellent. Continue daily drills to maintain command readiness.";
    if (user.quizzesAttempted < 5) {
      fieldReport = "Welcome, Officer Candidate. Your first objective is to complete 5 tactical drills to establish a baseline performance profile.";
    } else if (progress < 25) {
      fieldReport = "New rank within reach. Intensify training across all sectors to secure your promotion.";
    }

    // Dynamic AI Field Report
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `You are the Command AI for a defense exam preparation platform. 
Generate a short, motivating "Field Report" for a candidate (Officer Candidate).
Candidate Stats:
- Name: ${user.name}
- Current Rank: ${currentRank.name}
- Score: ${currentScore}
- Quizzes Attempted: ${user.quizzesAttempted || 0}
- Accuracy: ${user.quizzesAttempted > 0 ? Math.round((currentScore / (user.quizzesAttempted * 10)) * 100) : 0}%
- Progress to next rank: ${progress}%

The report should be 1-2 sentences long. Use a tactical, military tone (e.g., "operational readiness", "strategic objective"). Be encouraging.
Output ONLY the report text, no quotes or extra text.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
        });

        const aiReport = response.choices[0]?.message?.content?.trim();
        if (aiReport) {
          fieldReport = aiReport;
        }
      } catch (error) {
        console.error('Failed to generate AI field report:', error);
        // Fallback to the static report defined above
      }
    }

    return NextResponse.json({
      success: true,
      stats: {
        name: user.name,
        email: user.email,
        score: currentScore,
        quizzesAttempted: user.quizzesAttempted || 0,
        accuracy: user.quizzesAttempted > 0 ? Math.round((currentScore / (user.quizzesAttempted * 10)) * 100) : 0,
        rank: currentRank.name,
        nextRank: nextRank?.name || 'Max Rank Reached',
        progress,
        streak: user.streak || 0,
        badges: user.badges || [],
        subscriptionStatus: user.subscriptionStatus || 'inactive',
        fieldReport
      }
    });

  } catch (error: unknown) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
