#!/usr/bin/env node

import { loadEnvFile, CHROME_UA, runSeed } from './_seed-utils.mjs';

loadEnvFile(import.meta.url);

const CANONICAL_KEY = 'emergency:road-closures:v1';
const CACHE_TTL = 600; // 10 min

// Hawaii DOT road conditions (primary — GoAkamai/511hi.com is offline)
const HIDOT_API = 'https://hidot.hawaii.gov/highways/roadwork/';
// GoAkamai is offline as of 2026-03 — kept as aspirational fallback
const GOAKAMAI_API = 'https://goakamai.org/api/v1/incidents';

function stripHtml(html) {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
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
    const description = stripHtml((block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) || [])[1] || '');
    const pubDate = stripHtml((block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '');
    items.push({ title, link, description, pubDate });
  }
  return items;
}

// Attempt to detect which island a road closure is on from the text
function detectIsland(text) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('oahu') || lower.includes('honolulu') || lower.includes('h-1') || lower.includes('h-2') || lower.includes('h-3') || lower.includes('likelike') || lower.includes('pali')) return 'Oahu';
  if (lower.includes('maui') || lower.includes('kahului') || lower.includes('lahaina') || lower.includes('hana')) return 'Maui';
  if (lower.includes('big island') || lower.includes('hawaii island') || lower.includes('hilo') || lower.includes('kona') || lower.includes('saddle road')) return 'Hawaii';
  if (lower.includes('kauai') || lower.includes('lihue') || lower.includes('kapaa')) return 'Kauai';
  if (lower.includes('molokai')) return 'Molokai';
  if (lower.includes('lanai')) return 'Lanai';
  return 'Unknown';
}

async function tryGoAkamai() {
  try {
    const resp = await fetch(GOAKAMAI_API, {
      headers: { Accept: 'application/json', 'User-Agent': CHROME_UA },
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) return null;

    const data = await resp.json();
    const incidents = Array.isArray(data) ? data : (data.incidents || data.features || []);
    if (incidents.length === 0) return null;

    return incidents.map((inc, idx) => {
      const props = inc.properties || inc;
      return {
        id: String(props.id || inc.id || `goakamai-${idx}`),
        road: props.road || props.street || props.title || '',
        location: props.location || props.description || '',
        reason: props.reason || props.type || props.eventType || 'Unknown',
        status: props.status || 'active',
        island: detectIsland(`${props.road || ''} ${props.location || ''} ${props.description || ''}`),
        latitude: props.latitude || inc.geometry?.coordinates?.[1] || null,
        longitude: props.longitude || inc.geometry?.coordinates?.[0] || null,
        detour: props.detour || null,
        updatedAt: props.updatedAt || props.lastUpdated || new Date().toISOString(),
      };
    });
  } catch (e) {
    console.warn(`  GoAkamai API failed: ${e.message}`);
    return null;
  }
}

async function tryGoogleNewsRss() {
  try {
    const query = encodeURIComponent('hawaii road closure OR road closed');
    const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': CHROME_UA, Accept: 'application/rss+xml, text/xml, */*' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) return null;

    const xml = await resp.text();
    const items = parseRssItems(xml).slice(0, 20);

    return items
      .filter(item => item.title)
      .map((item, idx) => ({
        id: `gnews-${Date.now()}-${idx}`,
        road: '',
        location: item.title,
        reason: 'Reported via news',
        status: 'reported',
        island: detectIsland(item.title + ' ' + item.description),
        latitude: null,
        longitude: null,
        detour: null,
        updatedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        sourceUrl: item.link || '',
      }));
  } catch (e) {
    console.warn(`  Google News RSS failed: ${e.message}`);
    return null;
  }
}

async function fetchRoadClosures() {
  // Try Google News RSS first (GoAkamai/511hi.com has been offline since 2026-03)
  let closures = await tryGoogleNewsRss();
  let source = 'google-news-rss';

  if (!closures || closures.length === 0) {
    console.log('  Google News RSS unavailable, trying GoAkamai');
    closures = await tryGoAkamai();
    source = 'goakamai';
  }

  if (!closures) closures = [];

  console.log(`  ${closures.length} road closures/incidents (source: ${source})`);
  return { closures, source, fetchedAt: new Date().toISOString() };
}

function validate(data) {
  // Zero closures is valid — may mean no current incidents
  return Array.isArray(data?.closures);
}

runSeed('emergency', 'road-closures', CANONICAL_KEY, fetchRoadClosures, {
  validateFn: validate,
  ttlSeconds: CACHE_TTL,
  sourceVersion: 'goakamai+gnews',
  recordCount: (d) => d?.closures?.length || 0,
}).catch((err) => {
  const _cause = err.cause ? ` (cause: ${err.cause.message || err.cause.code || err.cause})` : ''; console.error('FATAL:', (err.message || err) + _cause);
  process.exit(1);
});
