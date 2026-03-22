import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Payment } from '@/models/Payment';
import { User } from '@/models/User';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    // Simplified admin check, ideally check session.role === 'admin'
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    // Fetch payments with user emails populated
    const payments = await Payment.find().populate('userId', 'email name').sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, payments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { paymentId, status } = await req.json();

    const payment = await Payment.findById(paymentId);
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    payment.status = status;
    await payment.save();

    if (status === 'approved') {
      const user = await User.findById(payment.userId);
      if (user) {
        user.subscriptionStatus = 'active';
        
        let daysToAdd = 0;
        if (payment.plan === '1_week') daysToAdd = 7;
        else if (payment.plan === '1_month') daysToAdd = 30;
        else if (payment.plan === '3_months') daysToAdd = 90;

        // If they already have an active sub, add to the end of it, otherwise start from today
        const baseDate = user.subscriptionExpiry && user.subscriptionExpiry > new Date() 
          ? user.subscriptionExpiry 
          : new Date();

        const newExpiry = new Date(baseDate);
        newExpiry.setDate(newExpiry.getDate() + daysToAdd);

        user.subscriptionExpiry = newExpiry;
        await user.save();
      }
    } else if (status === 'rejected') {
       // Optional: revert subscription if accidentally rejecting an approved payment
    }

    return NextResponse.json({ success: true, message: 'Payment status updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
  }
}
