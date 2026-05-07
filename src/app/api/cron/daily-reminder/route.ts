import { NextResponse } from 'next/server';
import webpush from 'web-push';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Security Check (Vercel Cron Secret)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In development, we might want to bypass this for testing, but let's be strict for now
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    await connectToDatabase();
    const users = await User.find({});
    
    // 2. Configure Web Push
    webpush.setVapidDetails(
      'mailto:admin@dfenceprep.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string
    );

    const results = {
      pushSent: 0,
      emailsSent: 0,
      errors: 0
    };

    // 3. Process Notifications
    const tasks = users.map(async (user) => {
      try {
        // Send Email
        await sendEmail({
          to: user.email,
          subject: "Mission Ready? Your Daily Tactical Briefing is Here! 🎯",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 20px;">
              <div style="background-color: #0f172a; padding: 30px; border-radius: 15px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">DFENCE PREP</h1>
                <p style="color: #60a5fa; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; margin-top: 10px;">Daily Intelligence Briefing</p>
              </div>
              
              <div style="padding: 30px; background-color: white; border-radius: 15px; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                <h2 style="color: #0f172a; margin-top: 0;">Good morning, Officer Candidate ${user.name || ''}!</h2>
                <p style="color: #475569; line-height: 1.6;">
                  Fresh tactical intelligence from all major defence sectors has just been processed by our Command AI. 
                  Your daily drills are now live and waiting for your assessment.
                </p>
                
                <div style="background-color: #eff6ff; padding: 20px; border-radius: 12px; border-left: 4px solid #2563eb; margin: 25px 0;">
                  <p style="margin: 0; color: #1e40af; font-weight: bold;">Current Operational Status:</p>
                  <p style="margin: 5px 0 0 0; color: #1e3a8a; font-size: 14px;">Rank: ${user.score > 500 ? 'Major' : 'Lieutenant Candidate'} | Active Streak: ${user.streak || 0} Days</p>
                </div>

                <a href="https://dfenceprep.com/daily-quiz" style="display: block; background-color: #2563eb; color: white; text-align: center; padding: 16px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 30px;">Launch Today's Drill</a>
              </div>
              
              <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 30px;">
                Dfence Prep Intelligence Wing &copy; 2026<br>
                You are receiving this because you are a registered candidate at DfencePrep.
              </p>
            </div>
          `
        });
        results.emailsSent++;

        // Send Push Notification if subscribed
        if (user.pushSubscription) {
          const sub = JSON.parse(JSON.stringify(user.pushSubscription)) as webpush.PushSubscription;
          await webpush.sendNotification(sub, JSON.stringify({ 
            title: "Daily Drill is Live! 🎯", 
            body: `Officer ${user.name || ''}, your daily tactical assessment is ready. Launch the mission now.`,
            icon: '/favicon.ico'
          }));
          results.pushSent++;
        }
      } catch (err) {
        console.error(`Failed to notify user ${user.email}:`, err);
        results.errors++;
      }
    });

    await Promise.all(tasks);

    return NextResponse.json({ 
      success: true, 
      summary: results 
    });

  } catch (error: any) {
    console.error('Daily Reminder Cron Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
