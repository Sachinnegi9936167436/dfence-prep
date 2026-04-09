import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    const body = await req.json();
    const { email, score, totalQuestions } = body;

    if (!email) {
      console.error('Submission Error: Missing email');
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Processing submisson for ${email}: Score ${score}/${totalQuestions}`);

    // Case-insensitive search for the user
    let user = await User.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    
    if (!user) {
      console.warn(`User not found for email: ${email}. Scoring ignored.`);
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    user.score = (user.score || 0) + score;
    user.quizzesAttempted = (user.quizzesAttempted || 0) + 1;

    await user.save();
    console.log(`Successfully updated profile for ${email}. New Score: ${user.score}`);

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
  }
}
