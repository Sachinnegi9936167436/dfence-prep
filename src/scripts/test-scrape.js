const cheerio = require('cheerio');

async function scrapeDefenceIn() {
  console.log('Fetching homepage...');
  const res = await fetch('https://defence.in/');
  const html = await res.text();
  const $ = cheerio.load(html);

  const threadLinks = new Set();
  $('a[href^="/threads/"]').each((i, el) => {
    const href = $(el).attr('href');
    if (href && !href.includes('/unread') && !href.includes('/latest') && !href.includes('/post-')) {
      threadLinks.add(href);
    }
  });

  const urls = Array.from(threadLinks).slice(0, 3);
  console.log('Found threads:', urls);

  for (const url of urls) {
    console.log(`Fetching thread: https://defence.in${url}`);
    const threadRes = await fetch(`https://defence.in${url}`);
    const threadHtml = await threadRes.text();
    const thread$ = cheerio.load(threadHtml);
    
    const title = thread$('h1.p-title-value').text().replace(/\n/g, '').trim();
    
    const firstPost = thread$('.message-body .bbWrapper').first();
    firstPost.find('script, .bbCodeBlock--quote').remove();
    let content = firstPost.text().trim().replace(/\s+/g, ' ');

    if (content.includes('lightbox_close')) {
       // Find the end of JSON by locating the last brace or just use string split
       const parts = content.split('}');
       content = parts.slice(1).join('}').trim();
    }
    // If it's still messed up, string split on some known boundary or just rely on the AI to read it
    
    console.log(`Title: ${title}`);
    console.log(`Content snippet: ${content.substring(0, 200)}...`);
    console.log('---');
  }
}

scrapeDefenceIn().catch(console.error);
