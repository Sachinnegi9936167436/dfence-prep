import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';

const generateOtpEmailHtml = (otp: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #334155;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #0f172a; margin: 0; font-size: 24px;">Welcome to DfencePrep</h1>
      <p style="color: #64748b; margin-top: 8px;">Your gateway to excellence</p>
    </div>
    
    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <h2 style="color: #1e293b; font-size: 20px; margin-top: 0; text-align: center;">Verify Your Account</h2>
      <p style="font-size: 16px; line-height: 1.6; text-align: center;">Thank you for joining DfencePrep. Please use the verification code below to complete your registration:</p>
      
      <div style="background-color: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; border: 1px dashed #cbd5e1;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #2563eb; font-family: monospace;">${otp}</span>
      </div>
      
      <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 0;">This code will expire in 10 minutes for your security.</p>
    </div>
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
        &copy; ${new Date().getFullYear()} DfencePrep. All rights reserved.<br />
        New Delhi, India | <a href="#" style="color: #64748b; text-decoration: underline;">Terms of Service</a><br />
        If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
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
