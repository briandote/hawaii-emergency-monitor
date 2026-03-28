#!/usr/bin/env node

import { loadEnvFile, CHROME_UA, runSeed } from './_seed-utils.mjs';

loadEnvFile(import.meta.url);

const CANONICAL_KEY = 'emergency:power-outages:v1';
const CACHE_TTL = 600; // 10 min

// Hawaiian Electric outage endpoints
// The outage map moved to an Azure-hosted Blazor WASM app (outagemap-heco.azurewebsites.net)
// which does not expose a public JSON API. Endpoints return 406 without the WASM runtime.
// We try the Azure endpoints first, then fall back to Google News RSS for outage reports.
const HECO_OUTAGE_URLS = [
  'https://outagemap-heco.azurewebsites.net/api/outages',
  'https://outagemap-heco.azurewebsites.net/heco/api/outages',
];

// Google News RSS fallback for HECO outage reports
const HECO_NEWS_RSS = 'https://news.google.com/rss/search?q=(%22hawaiian+electric%22+OR+%22HECO%22)+(%22power+outage%22+OR+%22outage%22)+when:3d&hl=en-US&gl=US&ceid=US:en';

function detectIsland(text) {
  const lower = (text || '').toLowerCase();
  if (lower.includes('oahu') || lower.includes('honolulu') || lower.includes('pearl city') || lower.includes('kailua') || lower.includes('kaneohe') || lower.includes('waipahu') || lower.includes('kapolei')) return 'Oahu';
  if (lower.includes('maui') || lower.includes('kahului') || lower.includes('lahaina') || lower.includes('kihei')) return 'Maui';
  if (lower.includes('big island') || lower.includes('hawaii island') || lower.includes('hilo') || lower.includes('kona')) return 'Hawaii';
  if (lower.includes('molokai')) return 'Molokai';
  if (lower.includes('lanai')) return 'Lanai';
  return 'Oahu'; // HECO primarily serves Oahu
}

async function tryHecoApi() {
  for (const url of HECO_OUTAGE_URLS) {
    try {
      const resp = await fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': CHROME_UA,
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!resp.ok) {
        console.warn(`  HECO ${url}: HTTP ${resp.status}`);
        continue;
      }

      const data = await resp.json();
      const outages = Array.isArray(data) ? data : (data.outages || data.features || data.incidents || []);

      return outages.map((o, idx) => {
        const props = o.properties || o;
        return {
          id: String(props.id || o.id || `heco-${idx}`),
          area: props.area || props.location || props.name || '',
          island: detectIsland(props.area || props.location || props.name || ''),
          customersAffected: props.customersAffected || props.customers || props.numCustomers || null,
          cause: props.cause || props.reason || 'Under investigation',
          estimatedRestoration: props.estimatedRestoration || props.etr || props.estimatedTimeOfRestoration || null,
          startTime: props.startTime || props.outageStart || props.createdAt || null,
          polygon: o.geometry?.coordinates || null,
        };
      });
    } catch (e) {
      console.warn(`  HECO ${url}: ${e.message}`);
    }
  }
  return null;
}

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

async function tryHecoNewsRss() {
  try {
    const resp = await fetch(HECO_NEWS_RSS, {
      headers: { 'User-Agent': CHROME_UA, Accept: 'application/rss+xml, text/xml, */*' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) return null;

    const xml = await resp.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const block = match[1];
      const title = stripHtml((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
      const pubDate = stripHtml((block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] || '');
      items.push({ title, pubDate });
    }

    return items.slice(0, 15).map((item, idx) => ({
      id: `heco-news-${Date.now()}-${idx}`,
      area: item.title,
      island: detectIsland(item.title),
      customersAffected: null,
      cause: 'Reported via news',
      estimatedRestoration: null,
      startTime: item.pubDate ? new Date(item.pubDate).toISOString() : null,
      polygon: null,
    }));
  } catch (e) {
    console.warn(`  HECO News RSS: ${e.message}`);
    return null;
  }
}

async function fetchPowerOutages() {
  let outages = await tryHecoApi();
  let source = 'hawaiianelectric-api';

  if (!outages) {
    console.log('  HECO API unavailable, falling back to Google News RSS');
    outages = await tryHecoNewsRss();
    source = 'google-news-rss';
  }

  if (!outages) {
    console.log('  All HECO sources unavailable — returning empty outage set');
    outages = [];
    source = 'unavailable';
  }

  console.log(`  ${outages.length} power outages (source: ${source})`);
  return { outages, source, fetchedAt: new Date().toISOString() };
}

function validate(data) {
  // Zero outages is valid — may mean no current power issues
  return Array.isArray(data?.outages);
}

runSeed('emergency', 'power-outages', CANONICAL_KEY, fetchPowerOutages, {
  validateFn: validate,
  ttlSeconds: CACHE_TTL,
  sourceVersion: 'heco-outages',
  recordCount: (d) => d?.outages?.length || 0,
}).catch((err) => {
  const _cause = err.cause ? ` (cause: ${err.cause.message || err.cause.code || err.cause})` : ''; console.error('FATAL:', (err.message || err) + _cause);
  process.exit(1);
});
