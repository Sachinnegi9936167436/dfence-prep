import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Payment } from '@/models/Payment';
import { getSession } from '@/lib/auth';
import Razorpay from 'razorpay';

const planPrices: Record<string, number> = {
  '1_week': 30,
  '1_month': 50,
  '3_months': 80,
};

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!plan || !planPrices[plan]) {
      return NextResponse.json({ error: 'Invalid or missing plan' }, { status: 400 });
    }

    const price = planPrices[plan];
    const amountInPaise = price * 100;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('Razorpay API keys are not configured in environment variables.');
      return NextResponse.json(
        { error: 'Payment gateway configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    await connectToDatabase();

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${session.userId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId: session.userId as any,
      plan,
      amount: price,
      razorpayOrderId: order.id,
      paymentGateway: 'razorpay',
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error: unknown) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
