import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    // We return success even if user not found for security reasons
    if (!user) {
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset - DfencePrep',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your DfencePrep account. Click the button below to set a new password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Reset link sent successfully' });
  } catch (error: any) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
