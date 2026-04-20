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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (user.lastQuizDate) {
      const lastDate = new Date(user.lastQuizDate);
      const lastQuizDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      
      const diffTime = Math.abs(today.getTime() - lastQuizDay.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      if (diffDays === 1) {
        user.streak = (user.streak || 0) + 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }
    user.lastQuizDate = now;

    // Gamification: Badge Assignment Engine
    const currentBadges = user.badges || [];
    let badgeAwarded = false;
    
    if (score === totalQuestions && score > 0 && !currentBadges.includes('Sniper Badge')) {
      currentBadges.push('Sniper Badge');
      badgeAwarded = true;
    }

    const currentHour = now.getHours();
    if (currentHour >= 0 && currentHour < 4 && !currentBadges.includes('Night Owl Badge')) {
      currentBadges.push('Night Owl Badge');
      badgeAwarded = true;
    }

    if (user.streak >= 30 && !currentBadges.includes('Veteran Badge')) {
      currentBadges.push('Veteran Badge');
      badgeAwarded = true;
    }

    if (badgeAwarded) {
      user.badges = currentBadges;
    }

    await user.save();
    console.log(`Successfully updated profile for ${email}. New Score: ${user.score}`);

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to submit score' }, { status: 500 });
  }
}
