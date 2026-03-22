import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Article } from '@/models/Article';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query = category ? { category } : {};

    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, articles });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
