#!/usr/bin/env node

import { loadEnvFile, CHROME_UA, runSeed } from './_seed-utils.mjs';

loadEnvFile(import.meta.url);

const NWS_API = 'https://api.weather.gov/alerts/active?area=HI';
const CANONICAL_KEY = 'emergency:hawaii-alerts:v1';
const CACHE_TTL = 300; // 5 min — alerts are time-critical

function extractPolygon(geometry) {
  if (!geometry) return null;
  try {
    if (geometry.type === 'Polygon') {
      return geometry.coordinates[0]?.map(c => [c[0], c[1]]) || null;
    }
    if (geometry.type === 'MultiPolygon') {
      return geometry.coordinates.map(poly => poly[0]?.map(c => [c[0], c[1]]) || []);
    }
  } catch { /* ignore malformed geometry */ }
  return null;
}

async function fetchHawaiiAlerts() {
  const resp = await fetch(NWS_API, {
    headers: {
      Accept: 'application/geo+json',
      'User-Agent': '(worldmonitor.app, admin@worldmonitor.app)',
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!resp.ok) throw new Error(`NWS API error: ${resp.status}`);

  const data = await resp.json();
  const features = data.features || [];

  const alerts = features
    .filter(f => f?.properties)
    .map(f => {
      const p = f.properties;
      return {
        id: f.id || '',
        event: p.event || '',
        severity: p.severity || 'Unknown',
        urgency: p.urgency || 'Unknown',
        certainty: p.certainty || 'Unknown',
        headline: p.headline || '',
        description: (p.description || '').slice(0, 1000),
        instruction: (p.instruction || '').slice(0, 1000),
        areaDesc: p.areaDesc || '',
        onset: p.onset || '',
        expires: p.expires || '',
        senderName: p.senderName || '',
        geocode: p.geocode || null,
        polygon: extractPolygon(f.geometry),
      };
    });

  console.log(`  ${alerts.length} active Hawaii alerts`);
  return { alerts, fetchedAt: new Date().toISOString() };
}

function validate(data) {
  // Hawaii may have zero active alerts — that is valid
  return Array.isArray(data?.alerts);
}

runSeed('emergency', 'hawaii-alerts', CANONICAL_KEY, fetchHawaiiAlerts, {
  validateFn: validate,
  ttlSeconds: CACHE_TTL,
  sourceVersion: 'nws-active-hi',
  recordCount: (d) => d?.alerts?.length || 0,
}).catch((err) => {
  const _cause = err.cause ? ` (cause: ${err.cause.message || err.cause.code || err.cause})` : ''; console.error('FATAL:', (err.message || err) + _cause);
  process.exit(1);
});
