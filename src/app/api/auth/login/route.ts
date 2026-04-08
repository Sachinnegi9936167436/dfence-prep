import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { email: rawEmail, password } = await req.json();
    const email = rawEmail?.toLowerCase().trim();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // fallback for existing users without password for testing
    let isValid = false;
    if (user.password) {
      isValid = await bcrypt.compare(password, user.password);
    } else if (password === 'admin') {
      isValid = true; 
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return NextResponse.json({ 
        error: 'Email not verified', 
        requiresVerification: true,
        email: user.email 
      }, { status: 403 });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();

    // Set secure JWT cookie
    await setSessionCookie({ 
      userId: user._id.toString(), 
      email: user.email, 
      name: user.name,
      role: user.role || 'user',
      subscriptionStatus: user.subscriptionStatus || 'inactive'
    });

    return NextResponse.json({ success: true, message: 'Logged in successfully' });
  } catch (error: any) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
