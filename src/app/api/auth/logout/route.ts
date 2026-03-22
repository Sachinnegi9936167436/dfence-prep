import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ success: true });
}

export async function GET(req: Request) {
  await clearSessionCookie();
  const { origin } = new URL(req.url);
  return NextResponse.redirect(new URL('/login', origin));
}
