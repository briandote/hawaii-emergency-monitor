#!/usr/bin/env node

import { loadEnvFile, CHROME_UA, runSeed } from './_seed-utils.mjs';

loadEnvFile(import.meta.url);

const USGS_API = 'https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd=HI&parameterCd=00065,00060&siteStatus=active';
const CANONICAL_KEY = 'emergency:stream-gauges:v1';
const CACHE_TTL = 600; // 10 min

// USGS parameter codes
const PARAM_GAUGE_HEIGHT = '00065'; // ft
const PARAM_DISCHARGE = '00060';    // cfs

async function fetchStreamGauges() {
  const resp = await fetch(USGS_API, {
    headers: { Accept: 'application/json', 'User-Agent': CHROME_UA },
    signal: AbortSignal.timeout(30_000),
  });
  if (!resp.ok) throw new Error(`USGS API error: ${resp.status}`);

  const data = await resp.json();
  const timeSeries = data?.value?.timeSeries || [];

  // Group time series by site code — each site may have multiple parameters
  const siteMap = new Map();

  for (const ts of timeSeries) {
    const sourceInfo = ts.sourceInfo || {};
    const variable = ts.variable || {};
    const values = ts.values?.[0]?.value || [];
    const latest = values[values.length - 1];

    const siteCode = sourceInfo.siteCode?.[0]?.value || '';
    if (!siteCode) continue;

    if (!siteMap.has(siteCode)) {
      const geoLocation = sourceInfo.geoLocation?.geogLocation || {};
      siteMap.set(siteCode, {
        siteCode,
        siteName: sourceInfo.siteName || '',
        latitude: geoLocation.latitude || null,
        longitude: geoLocation.longitude || null,
        gaugeHeight: null,
        discharge: null,
        dateTime: null,
        floodStage: null, // NWS flood stage data not available via this API
      });
    }

    const site = siteMap.get(siteCode);
    const paramCode = variable.variableCode?.[0]?.value || '';
    const val = latest ? parseFloat(latest.value) : null;
    const dateTime = latest?.dateTime || null;

    if (paramCode === PARAM_GAUGE_HEIGHT && val !== null && val !== -999999) {
      site.gaugeHeight = val;
      if (dateTime) site.dateTime = dateTime;
    } else if (paramCode === PARAM_DISCHARGE && val !== null && val !== -999999) {
      site.discharge = val;
      if (!site.dateTime && dateTime) site.dateTime = dateTime;
    }
  }

  const gauges = [...siteMap.values()].filter(g => g.gaugeHeight !== null || g.discharge !== null);

  console.log(`  ${gauges.length} active stream gauges in Hawaii`);
  return { gauges, fetchedAt: new Date().toISOString() };
}

function validate(data) {
  return Array.isArray(data?.gauges);
}

runSeed('emergency', 'stream-gauges', CANONICAL_KEY, fetchStreamGauges, {
  validateFn: validate,
  ttlSeconds: CACHE_TTL,
  sourceVersion: 'usgs-iv-hi',
  recordCount: (d) => d?.gauges?.length || 0,
}).catch((err) => {
  const _cause = err.cause ? ` (cause: ${err.cause.message || err.cause.code || err.cause})` : ''; console.error('FATAL:', (err.message || err) + _cause);
  process.exit(1);
});
