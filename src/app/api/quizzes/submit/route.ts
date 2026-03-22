import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { email, name, score, totalQuestions } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({ email, name, score, quizzesAttempted: 1 });
    } else {
      user.score += score;
      user.quizzesAttempted += 1;
    }

    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
  }
}
