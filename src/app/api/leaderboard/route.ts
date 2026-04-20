import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch top 50 users by score
    const topUsers = await User.find({ score: { $gt: 0 } })
      .sort({ score: -1, quizzesAttempted: 1 })
      .limit(50)
      .select('name score quizzesAttempted')
      .lean();

    return NextResponse.json({ success: true, leaderboard: topUsers });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
