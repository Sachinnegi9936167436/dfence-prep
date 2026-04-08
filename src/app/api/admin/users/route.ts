import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch only verified users and strip out password fields
    const users = await User.find({ isVerified: true }, '-password').sort({ createdAt: -1 });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, password, name, role, subscriptionStatus } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required parameters' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'A user with this email address already exists in the system' }, { status: 400 });
    }

    // Securely hash the password string
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name: name || '',
      role: role || 'user',
      subscriptionStatus: subscriptionStatus || 'inactive',
      isVerified: true
    });

    // Remove the password buffer before transmitting back
    const userObj = newUser.toObject();
    delete userObj.password;

    return NextResponse.json({ success: true, user: userObj });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required for deletion' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Protection fallback to stop a logged-in admin from deleting themselves
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return NextResponse.json({ success: false, error: 'Target user could not be found' }, { status: 404 });
    }
    
    if (userToDelete.email === session.email) {
      return NextResponse.json({ success: false, error: 'You are absolutely not permitted to delete your own admin account.' }, { status: 400 });
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, email, role, subscriptionStatus, newPassword } = await request.json();

    if (!id || !email) {
      return NextResponse.json({ success: false, error: 'User ID and Email are required parameters for updating.' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Another user is already actively using this designated email.' }, { status: 400 });
    }

    const updatePayload: any = { name, email, role, subscriptionStatus };
    if (newPassword && newPassword.length >= 6) {
      updatePayload.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User record sequence could not be found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
