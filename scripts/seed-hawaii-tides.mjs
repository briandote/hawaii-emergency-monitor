#!/usr/bin/env node

import { loadEnvFile, CHROME_UA, runSeed, sleep } from './_seed-utils.mjs';

loadEnvFile(import.meta.url);

const CANONICAL_KEY = 'emergency:tides:v1';
const CACHE_TTL = 900; // 15 min

const NOAA_API = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';

// Hawaii tide stations
const STATIONS = [
  { id: '1612340', name: 'Honolulu', island: 'Oahu', latitude: 21.3067, longitude: -157.8670 },
  { id: '1615680', name: 'Kahului', island: 'Maui', latitude: 20.8950, longitude: -156.4767 },
  { id: '1617433', name: 'Kawaihae', island: 'Hawaii', latitude: 20.0367, longitude: -155.8317 },
  { id: '1611400', name: 'Nawiliwili', island: 'Kauai', latitude: 21.9544, longitude: -159.3561 },
];

async function fetchStationData(station) {
  // Fetch observed water level
  const now = new Date();
  const begin = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
  // NOAA expects yyyyMMdd HH:mm format (with space and colon)
  const fmt = (d) => {
    const iso = d.toISOString();
    return iso.slice(0, 4) + iso.slice(5, 7) + iso.slice(8, 10) + ' ' + iso.slice(11, 16);
  };
  const beginStr = fmt(begin);
  const endStr = fmt(now);

  const params = new URLSearchParams({
    begin_date: beginStr,
    end_date: endStr,
    station: station.id,
    product: 'water_level',
    datum: 'MLLW',
    units: 'english',
    time_zone: 'lst',
    format: 'json',
    application: 'worldmonitor',
  });

  const resp = await fetch(`${NOAA_API}?${params}`, {
    headers: { 'User-Agent': CHROME_UA },
    signal: AbortSignal.timeout(15_000),
  });
  if (!resp.ok) throw new Error(`NOAA station ${station.id}: HTTP ${resp.status}`);

  const data = await resp.json();
  if (data.error) {
    console.warn(`  Station ${station.id} (${station.name}): ${data.error.message || 'API error'}`);
    return null;
  }

  const observations = data.data || [];
  const latest = observations[observations.length - 1];
  if (!latest) return null;

  // Fetch predictions for comparison
  let predictedLevel = null;
  try {
    const predParams = new URLSearchParams({
      begin_date: beginStr,
      end_date: endStr,
      station: station.id,
      product: 'predictions',
      datum: 'MLLW',
      units: 'english',
      time_zone: 'lst',
      format: 'json',
      application: 'worldmonitor',
    });

    const predResp = await fetch(`${NOAA_API}?${predParams}`, {
      headers: { 'User-Agent': CHROME_UA },
      signal: AbortSignal.timeout(10_000),
    });
    if (predResp.ok) {
      const predData = await predResp.json();
      const predictions = predData.predictions || [];
      // Find prediction closest to latest observation time
      const latestTime = latest.t;
      const match = predictions.find(p => p.t === latestTime);
      if (match) predictedLevel = parseFloat(match.v);
    }
  } catch {
    // Predictions are supplementary — proceed without them
  }

  return {
    stationId: station.id,
    stationName: station.name,
    latitude: station.latitude,
    longitude: station.longitude,
    island: station.island,
    waterLevel: parseFloat(latest.v),
    predictedLevel,
    timestamp: latest.t,
    quality: latest.q || null,
  };
}

async function fetchTides() {
  const results = [];

  for (let i = 0; i < STATIONS.length; i++) {
    if (i > 0) await sleep(200); // Rate limit NOAA requests
    try {
      const data = await fetchStationData(STATIONS[i]);
      if (data) {
        results.push(data);
        console.log(`  ${data.stationName}: ${data.waterLevel} ft MLLW`);
      }
    } catch (e) {
      console.warn(`  Station ${STATIONS[i].name}: ${e.message}`);
    }
  }

  if (results.length === 0) {
    throw new Error('All NOAA tide station fetches failed');
  }

  return { tides: results, fetchedAt: new Date().toISOString() };
}

function validate(data) {
  return Array.isArray(data?.tides) && data.tides.length >= 1;
}

runSeed('emergency', 'tides', CANONICAL_KEY, fetchTides, {
  validateFn: validate,
  ttlSeconds: CACHE_TTL,
  sourceVersion: 'noaa-coops-hi',
  recordCount: (d) => d?.tides?.length || 0,
}).catch((err) => {
  const _cause = err.cause ? ` (cause: ${err.cause.message || err.cause.code || err.cause})` : ''; console.error('FATAL:', (err.message || err) + _cause);
  process.exit(1);
});
