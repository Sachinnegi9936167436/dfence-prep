const cheerio = require('cheerio');

async function scrapeIndianExpress() {
  console.log('Fetching Indian Express Sports...');
  try {
    const res = await fetch('https://indianexpress.com/section/sports/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    
    if (!res.ok) {
      console.log('Request failed with status:', res.status);
      return;
    }
    
    const html = await res.text();
    const $ = cheerio.load(html);

    const articleLinks = new Set();
    // Indian express top news are usually in .articles or .title a
    $('.top-news a, .nation a, .articles a, h2 a, h3 a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('indianexpress.com/article/sports/')) {
        articleLinks.add(href);
      }
    });

    const urls = Array.from(articleLinks).slice(0, 3);
    console.log('Found article URLs:', urls);

    for (const url of urls) {
      console.log(`\nFetching article: ${url}`);
      const articleRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const articleHtml = await articleRes.text();
      const article$ = cheerio.load(articleHtml);
      
      const title = article$('h1.native_story_title, h1').first().text().trim();
      
      // Standard indian express article content body
      const contentNodes = article$('#storycenterbyline p, .story_details p, .full-details p');
      let content = '';
      contentNodes.each((i, el) => {
        content += article$(el).text().trim() + ' ';
      });
      content = content.replace(/\s+/g, ' ').trim();

      console.log(`Title: ${title}`);
      console.log(`Content snippet: ${content.substring(0, 200)}...`);
    }

  } catch (err) {
    console.error(err);
  }
}

scrapeIndianExpress();
