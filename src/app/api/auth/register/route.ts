import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from '@/lib/auth';

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
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name: name || 'Student',
    });

    // Automatically log in after registration
    await setSessionCookie({
      userId: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      role: 'user',
      subscriptionStatus: 'inactive'
    });

    return NextResponse.json({ success: true, message: 'User registered successfully' });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
