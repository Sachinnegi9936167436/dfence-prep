import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Article } from '@/models/Article';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const before = searchParams.get('before');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (category) query.category = category;
    if (before) {
      query.publishedAt = { $lt: new Date(before) };
    }

    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, articles });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
