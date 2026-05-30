import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectToDatabase from '@/lib/mongoose';
import { Payment } from '@/models/Payment';
import { User } from '@/models/User';
import { getSession, setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('Razorpay secret key is not configured in environment variables.');
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    // Verify payment signature
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the corresponding payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    if (payment.status === 'approved') {
      return NextResponse.json({ success: true, message: 'Payment already verified and processed' });
    }

    // Update payment record
    payment.status = 'approved';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    await payment.save();

    // Update user subscription
    const user = await User.findById(payment.userId);
    if (!user) {
      return NextResponse.json({ error: 'Associated user not found' }, { status: 404 });
    }

    user.subscriptionStatus = 'active';
    user.subscriptionPlan = payment.plan;

    let daysToAdd = 0;
    if (payment.plan === '1_week') daysToAdd = 7;
    else if (payment.plan === '1_month') daysToAdd = 30;
    else if (payment.plan === '3_months') daysToAdd = 90;

    const baseDate =
      user.subscriptionExpiry && user.subscriptionExpiry > new Date()
        ? user.subscriptionExpiry
        : new Date();

    const newExpiry = new Date(baseDate);
    newExpiry.setDate(newExpiry.getDate() + daysToAdd);

    user.subscriptionExpiry = newExpiry;
    await user.save();

    // Refresh session cookie with the new active subscription status and plan
    await setSessionCookie({ 
      userId: user._id.toString(), 
      email: user.email, 
      name: user.name,
      role: user.role || 'user',
      subscriptionStatus: 'active',
      subscriptionPlan: payment.plan
    });

    return NextResponse.json({ success: true, message: 'Payment verified and subscription activated' });
  } catch (error: unknown) {
    console.error('Razorpay Verification Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
