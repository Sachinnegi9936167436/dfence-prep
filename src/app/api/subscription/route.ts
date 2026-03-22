import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Payment } from '@/models/Payment';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { plan, amount, utrNumber } = await req.json();

    if (!plan || !amount || !utrNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Checking if UTR already exists to prevent duplicate spoofing
    const existingPayment = await Payment.findOne({ utrNumber });
    if (existingPayment) {
      return NextResponse.json({ error: 'UTR Number already submitted' }, { status: 400 });
    }

    const newPayment = await Payment.create({
      userId: session.userId,
      plan,
      amount,
      utrNumber,
      status: 'pending',
    });

    return NextResponse.json({ success: true, paymentId: newPayment._id });
  } catch (error: any) {
    console.error('Payment Submission Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
