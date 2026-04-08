import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

const generateOtpEmailHtml = (otp: string) => `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
    <h2 style="color: #1e293b; text-align: center;">Welcome to DfencePrep!</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">Thank you for signing up. Please use the following code to verify your account:</p>
    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">${otp}</span>
    </div>
    <p style="color: #475569; font-size: 14px; text-align: center;">This code will expire in 10 minutes.</p>
    <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 32px;">If you didn't create an account, you can safely ignore this email.</p>
  </div>
`;

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email: rawEmail, password, name } = await req.json();
    const email = rawEmail?.toLowerCase().trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json({ error: 'User already exists' }, { status: 400 });
      }
      
      // If user exists but is NOT verified, we allow "re-registration"
      // to update their password/name and send a new OTP
      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

      existingUser.password = hashedPassword;
      existingUser.name = name || 'Student';
      existingUser.otp = otp;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();

      await sendEmail({
        to: email,
        subject: 'Verify your account - DfencePrep',
        html: generateOtpEmailHtml(otp),
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Registration updated! Please verify your email with the new OTP.',
        redirectToVerify: true,
        email 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name: name || 'Student',
      otp,
      otpExpires,
      isVerified: false,
    });

    await sendEmail({
      to: email,
      subject: 'Verify your account - DfencePrep',
      html: generateOtpEmailHtml(otp),
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful! Please verify your email.',
      redirectToVerify: true,
      email 
    });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Registration failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
