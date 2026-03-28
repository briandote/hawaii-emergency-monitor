#!/usr/bin/env node

import { loadEnvFile, CHROME_UA, runSeed } from './_seed-utils.mjs';

loadEnvFile(import.meta.url);

const CANONICAL_KEY = 'emergency:local-news:v1';
const CACHE_TTL = 900; // 15 min

const NEWS_FEEDS = [
  { name: 'Civil Beat', url: 'https://www.civilbeat.org/feed/' },
  { name: 'Maui Now', url: 'https://mauinow.com/feed/' },
  { name: 'Big Island Now', url: 'https://bigislandnow.com/feed/' },
  { name: 'Kauai Now', url: 'https://news.google.com/rss/search?q=site:kauainow.com+when:3d&hl=en-US&gl=US&ceid=US:en' },
  { name: 'Hawaii News Now', url: 'https://www.hawaiinewsnow.com/arc/outboundfeeds/rss/?outputType=xml' },
];

function stripHtml(html) {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '\u201c')
    .replace(/&#8221;/g, '\u201d')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = stripHtml((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const link = stripHtml((block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || '');
    const pubDate = stripHtml((block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '');
    const description = stripHtml((block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || '').slice(0, 500);
    const category = stripHtml((block.match(/<category[^>]*>([\s\S]*?)<\/category>/i) || [])[1] || '');
    items.push({ title, link, pubDate, description, category });
  }
  return items;
}

function parseAtomEntries(xml) {
  const entries = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let match;
  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = stripHtml((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
    const linkMatch = block.match(/<link[^>]*href=["']([^"']+)["']/i);
    const link = linkMatch ? linkMatch[1] : '';
    const updated = stripHtml((block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) || [])[1] || '');
    const published = stripHtml((block.match(/<published[^>]*>([\s\S]*?)<\/published>/i) || [])[1] || '');
    const summary = stripHtml((block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || [])[1] || '').slice(0, 500);
    const category = stripHtml((block.match(/<category[^>]*term=["']([^"']+)["']/i) || [])[1] || '');
    entries.push({ title, link, pubDate: updated || published, description: summary, category });
  }
  return entries;
}

function parseFeed(xml) {
  if (xml.includes('<entry>') || xml.includes('<entry ')) return parseAtomEntries(xml);
  return parseRssItems(xml);
}

function isValidUrl(link) {
  if (!link) return false;
  try {
    const u = new URL(link);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

async function fetchFeed(feed) {
  try {
    const resp = await fetch(feed.url, {
      headers: {
        'User-Agent': CHROME_UA,
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) {
      console.warn(`  ${feed.name}: HTTP ${resp.status}`);
      return [];
    }
    const xml = await resp.text();
    const items = parseFeed(xml).slice(0, 15);

    return items
      .filter(item => item.title && isValidUrl(item.link))
      .map(item => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        source: feed.name,
        description: item.description || '',
        category: item.category || '',
      }));
  } catch (e) {
    console.warn(`  ${feed.name}: ${e.message}`);
    return [];
  }
}

async function fetchHawaiiNews() {
  const results = await Promise.allSettled(NEWS_FEEDS.map(fetchFeed));
  const all = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === 'fulfilled') {
      all.push(...r.value);
      console.log(`  ${NEWS_FEEDS[i].name}: ${r.value.length} articles`);
    } else {
      console.warn(`  ${NEWS_FEEDS[i].name} failed: ${r.reason?.message || r.reason}`);
    }
  }

  // Deduplicate by title
  const seen = new Set();
  const deduped = all.filter(a => {
    const key = a.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by publication date (newest first)
  deduped.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  console.log(`  ${deduped.length} total articles (deduplicated)`);
  return { articles: deduped, fetchedAt: new Date().toISOString() };
}

function validate(data) {
  return Array.isArray(data?.articles) && data.articles.length >= 1;
}

runSeed('emergency', 'local-news', CANONICAL_KEY, fetchHawaiiNews, {
  validateFn: validate,
  ttlSeconds: CACHE_TTL,
  sourceVersion: 'hi-rss-feeds',
  recordCount: (d) => d?.articles?.length || 0,
}).catch((err) => {
  const _cause = err.cause ? ` (cause: ${err.cause.message || err.cause.code || err.cause})` : ''; console.error('FATAL:', (err.message || err) + _cause);
  process.exit(1);
});
