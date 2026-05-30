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
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, password, name, role, subscriptionPlan } = await request.json();

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

    const plan = subscriptionPlan || 'none';
    let status: 'active' | 'inactive' = 'inactive';
    let expiry = null;
    if (plan !== 'none') {
      status = 'active';
      let days = 0;
      if (plan === '1_week') days = 7;
      else if (plan === '1_month') days = 30;
      else if (plan === '3_months') days = 90;
      
      expiry = new Date();
      expiry.setDate(expiry.getDate() + days);
    }

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name: name || '',
      role: role || 'user',
      subscriptionStatus: status,
      subscriptionPlan: plan,
      subscriptionExpiry: expiry,
      isVerified: true
    });

    // Remove the password buffer before transmitting back
    const userObj = newUser.toObject();
    delete userObj.password;

    return NextResponse.json({ success: true, user: userObj });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
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
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, email, role, subscriptionPlan, newPassword } = await request.json();

    if (!id || !email) {
      return NextResponse.json({ success: false, error: 'User ID and Email are required parameters for updating.' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Another user is already actively using this designated email.' }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User record sequence could not be found' }, { status: 404 });
    }

    // Update basic info
    user.name = name || '';
    user.email = email;
    user.role = role || 'user';

    if (newPassword && newPassword.length >= 6) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update subscription plan if provided
    if (subscriptionPlan !== undefined) {
      const isPlanChanging = subscriptionPlan !== user.subscriptionPlan;
      const isCurrentlyInactive = user.subscriptionStatus !== 'active' || !user.subscriptionExpiry || user.subscriptionExpiry < new Date();
      
      if (subscriptionPlan === 'none') {
        user.subscriptionPlan = 'none';
        user.subscriptionStatus = 'inactive';
        user.subscriptionExpiry = null;
      } else if (isPlanChanging || isCurrentlyInactive) {
        user.subscriptionPlan = subscriptionPlan;
        user.subscriptionStatus = 'active';
        let days = 0;
        if (subscriptionPlan === '1_week') days = 7;
        else if (subscriptionPlan === '1_month') days = 30;
        else if (subscriptionPlan === '3_months') days = 90;
        
        const baseDate = user.subscriptionExpiry && user.subscriptionExpiry > new Date()
          ? user.subscriptionExpiry
          : new Date();
        const newExpiry = new Date(baseDate);
        newExpiry.setDate(newExpiry.getDate() + days);
        user.subscriptionExpiry = newExpiry;
      }
    }

    await user.save();

    // Remove the password buffer before transmitting back
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({ success: true, user: userObj });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
