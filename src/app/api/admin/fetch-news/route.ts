import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { Article } from '@/models/Article';
import { Quiz } from '@/models/Quiz';
import { generateMCQsFromText } from '@/lib/openai';
import * as cheerio from 'cheerio';

// Define categories we want to fetch
const CATEGORIES = ['Defence', 'Sports', 'Awards', 'Books', 'Exercises', 'International Relations'];

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    // Implement a simple token check for admin route if desired, ignoring for now for simplicity, or just check a basic secret
    // if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    // We no longer strictly require NEWS_API_KEY if we are scraping everything, but let's keep it for other categories
    const apiKey = process.env.NEWS_API_KEY || 'dummy';

    const newArticlesCount: Record<string, number> = { Defence: 0, Sports: 0, Awards: 0, Books: 0, Exercises: 0, 'International Relations': 0 };
    const newQuizzesCount = 0;

    for (const category of CATEGORIES) {
      let articles: any[] = [];

      if (category === 'Defence') {
        try {
          // SCRAPE defence.in
          const res = await fetch('https://defence.in/');
          const html = await res.text();
          const $ = cheerio.load(html);

          const threadLinks = new Set<string>();
          $('a[href^="/threads/"]').each((i: number, el: any) => {
            const href = $(el).attr('href');
            if (href && !href.includes('/unread') && !href.includes('/latest') && !href.includes('/post-')) {
              threadLinks.add(href);
            }
          });

          const urls = Array.from(threadLinks).slice(0, 3);
          for (const url of urls) {
            const threadRes = await fetch(`https://defence.in${url}`);
            const threadHtml = await threadRes.text();
            const thread$ = cheerio.load(threadHtml);
            
            const title = thread$('h1.p-title-value').text().replace(/\\n/g, '').trim();
            const firstPost = thread$('.message-body .bbWrapper').first();
            firstPost.find('script, .bbCodeBlock--quote').remove();
            let content = firstPost.text().trim().replace(/\\s+/g, ' ');

            if (content.includes('lightbox_close')) {
               const parts = content.split('}');
               content = parts.slice(1).join('}').trim();
            }

            articles.push({
              title,
              description: content,
              url: `https://defence.in${url}`,
              image: '', // We can try to extract image, but leave empty for now
              publishedAt: new Date().toISOString()
            });
          }
        } catch (scrapeErr) {
          console.error("Failed to scrape defence.in", scrapeErr);
        }
      } else if (category === 'Sports') {
        try {
          // SCRAPE indianexpress.com/section/sports/
          const res = await fetch('https://indianexpress.com/section/sports/', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });
          const html = await res.text();
          const $ = cheerio.load(html);

          const articleLinks = new Set<string>();
          $('.top-news a, .nation a, .articles a, h2 a, h3 a').each((i: number, el: any) => {
            const href = $(el).attr('href');
            if (href && href.includes('indianexpress.com/article/sports/')) {
              articleLinks.add(href);
            }
          });

          const urls = Array.from(articleLinks).slice(0, 3);
          for (const url of urls) {
            const articleRes = await fetch(url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const articleHtml = await articleRes.text();
            const article$ = cheerio.load(articleHtml);
            
            const title = article$('h1.native_story_title, h1').first().text().trim();
            
            const contentNodes = article$('#storycenterbyline p, .story_details p, .full-details p');
            let content = '';
            contentNodes.each((i: number, el: any) => {
              content += article$(el).text().trim() + ' ';
            });
            content = content.replace(/\\s+/g, ' ').trim();

            if (title && content) {
              articles.push({
                title,
                description: content,
                url,
                image: '',
                publishedAt: new Date().toISOString()
              });
            }
          }
        } catch (scrapeErr) {
          console.error("Failed to scrape indianexpress.com", scrapeErr);
        }
      } else if (category === 'International Relations') {
        try {
          const res = await fetch('https://www.bbc.com/news/world', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
          });
          const html = await res.text();
          const $ = cheerio.load(html);

          const articleLinks = new Set<string>();
          $('a').each((i: number, el: any) => {
            const href = $(el).attr('href');
            if (href && href.includes('/articles/')) {
               articleLinks.add(href.startsWith('http') ? href : `https://www.bbc.com${href}`);
            }
          });

          const urls = Array.from(articleLinks).slice(0, 3);
          for (const url of urls) {
            const articleRes = await fetch(url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const articleHtml = await articleRes.text();
            const article$ = cheerio.load(articleHtml);
            
            const title = article$('h1').first().text().trim();
            
            let content = '';
            article$('div[data-component="text-block"]').slice(0, 10).each((i: number, el: any) => {
              const text = article$(el).text().trim();
              if (text) content += text + ' ';
            });
            content = content.replace(/\s+/g, ' ').trim();

            if (title && content) {
              articles.push({
                title,
                description: content,
                url,
                image: '',
                publishedAt: new Date().toISOString()
              });
            }
          }
        } catch (scrapeErr) {
          console.error("Failed to scrape BBC News World", scrapeErr);
        }
      } else {
        // Fallback to GNews
        const searchQuery = category === 'Exercises' ? '"military exercise" OR "joint military"' : category.toLowerCase();
        const gnewsUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&lang=en&max=3&apikey=${apiKey}`;
        const response = await fetch(gnewsUrl);
        if (response.ok) {
          const data = await response.json();
          articles = data.articles || [];
        } else {
          console.error(`Failed to fetch news for ${category}`);
        }
      }

      for (const item of articles) {
        // Check if article already exists by URL
        const existing = await Article.findOne({ sourceUrl: item.url });
        let targetArticle = existing;

        if (!existing) {
          targetArticle = await Article.create({
            title: item.title,
            content: item.description || item.content || item.title,
            category: category,
            sourceUrl: item.url,
            imageUrl: item.image,
            publishedAt: new Date(item.publishedAt),
            aiProcessed: false,
          });
          // @ts-ignore
          newArticlesCount[category]++;
        } else if (existing.aiProcessed) {
          continue; // Already processed
        }

        // Generate Quiz using OpenAI
        if (targetArticle && !targetArticle.aiProcessed) {
          try {
            const generatedQuizzes = await generateMCQsFromText(targetArticle.content, category);
            
            if (generatedQuizzes && generatedQuizzes.length > 0) {
              const quizDocs = generatedQuizzes.map((q: any) => ({
                articleId: targetArticle._id,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                category: category,
              }));
              
              await Quiz.insertMany(quizDocs);
              
              targetArticle.aiProcessed = true;
              await targetArticle.save();
            }
          } catch (aiError) {
            console.error(`Failed to generate MCQ for article ${targetArticle._id}:`, aiError);
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'News fetched and quizzes generated.',
      newArticlesCount
    });

  } catch (error: any) {
    console.error('Fetch News Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return POST(req);
}
