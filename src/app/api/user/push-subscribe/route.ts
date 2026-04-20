import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscription } = await req.json();
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription object required' }, { status: 400 });
    }

    await connectToDatabase();
    await User.findByIdAndUpdate(session.userId, { pushSubscription: subscription });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Push Subscribe Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
