import { NextResponse } from 'next/server';
import webpush from 'web-push';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, body } = await req.json();

    webpush.setVapidDetails(
      'mailto:admin@dfenceprep.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string
    );

    await connectToDatabase();
    const users = await User.find({ pushSubscription: { $ne: null } });

    const notifications = users.map(user => {
      // TypeScript safety cast
      const sub = JSON.parse(JSON.stringify(user.pushSubscription)) as webpush.PushSubscription;
      return webpush.sendNotification(sub, JSON.stringify({ title, body })).catch(e => {
        // Log errors, but don't fail the entire promise all
        console.error(`Failed pushing to ${user.email}`, e);
      });
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true, count: notifications.length });
  } catch (error) {
    console.error('Push error:', error);
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
  }
}
