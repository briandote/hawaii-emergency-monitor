#!/usr/bin/env node

import { loadEnvFile, runSeed } from './_seed-utils.mjs';

loadEnvFile(import.meta.url);

const CANONICAL_KEY = 'emergency:shelters:v1';
const CACHE_TTL = 1800; // 30 min

// Known Hawaii shelter locations (schools and community centers designated by HI-EMA).
// During active emergencies, status would be updated by HI-EMA feeds.
const SHELTERS = [
  // Oahu
  { id: 'hi-shelter-001', name: 'Kawananakoa Middle School', address: '49 Funchal St, Honolulu, HI 96813', latitude: 21.3167, longitude: -157.8472, island: 'Oahu', type: 'school' },
  { id: 'hi-shelter-002', name: 'McKinley High School', address: '1039 S King St, Honolulu, HI 96814', latitude: 21.2917, longitude: -157.8472, island: 'Oahu', type: 'school' },
  { id: 'hi-shelter-003', name: 'Farrington High School', address: '1564 N King St, Honolulu, HI 96817', latitude: 21.3333, longitude: -157.8833, island: 'Oahu', type: 'school' },
  { id: 'hi-shelter-004', name: 'Waipahu High School', address: '94-1211 Farrington Hwy, Waipahu, HI 96797', latitude: 21.3833, longitude: -158.0083, island: 'Oahu', type: 'school' },
  { id: 'hi-shelter-005', name: 'Pearl City High School', address: '2100 Hookiekie St, Pearl City, HI 96782', latitude: 21.3972, longitude: -157.9750, island: 'Oahu', type: 'school' },
  { id: 'hi-shelter-006', name: 'Mililani High School', address: '95-1200 Meheula Pkwy, Mililani, HI 96789', latitude: 21.4500, longitude: -158.0167, island: 'Oahu', type: 'school' },
  { id: 'hi-shelter-007', name: 'Kailua High School', address: '451 Ulumanu Dr, Kailua, HI 96734', latitude: 21.4000, longitude: -157.7417, island: 'Oahu', type: 'school' },
  { id: 'hi-shelter-008', name: 'Castle High School', address: '45-386 Kaneohe Bay Dr, Kaneohe, HI 96744', latitude: 21.4167, longitude: -157.8000, island: 'Oahu', type: 'school' },
  { id: 'hi-shelter-009', name: 'Kapolei High School', address: '91-5007 Kapolei Pkwy, Kapolei, HI 96707', latitude: 21.3347, longitude: -158.0589, island: 'Oahu', type: 'school' },
  { id: 'hi-shelter-010', name: 'Moanalua High School', address: '2825 Ala Ilima St, Honolulu, HI 96818', latitude: 21.3653, longitude: -157.9019, island: 'Oahu', type: 'school' },
  { id: 'hi-shelter-011', name: 'Neal S. Blaisdell Center', address: '777 Ward Ave, Honolulu, HI 96814', latitude: 21.2997, longitude: -157.8456, island: 'Oahu', type: 'community_center' },
  // Maui
  { id: 'hi-shelter-012', name: 'Maui High School', address: '660 S Lono Ave, Kahului, HI 96732', latitude: 20.8783, longitude: -156.4556, island: 'Maui', type: 'school' },
  { id: 'hi-shelter-013', name: 'Baldwin High School', address: '1650 Kaahumanu Ave, Wailuku, HI 96793', latitude: 20.8917, longitude: -156.4917, island: 'Maui', type: 'school' },
  { id: 'hi-shelter-014', name: 'War Memorial Gymnasium', address: '700 Halia Nakoa St, Wailuku, HI 96793', latitude: 20.8908, longitude: -156.5028, island: 'Maui', type: 'community_center' },
  // Big Island (Hawaii)
  { id: 'hi-shelter-015', name: 'Hilo High School', address: '556 Waianuenue Ave, Hilo, HI 96720', latitude: 19.7167, longitude: -155.0833, island: 'Hawaii', type: 'school' },
  { id: 'hi-shelter-016', name: 'Keaau High School', address: '16-725 Keaau-Pahoa Rd, Keaau, HI 96749', latitude: 19.6228, longitude: -155.0381, island: 'Hawaii', type: 'school' },
  { id: 'hi-shelter-017', name: 'Kealakehe High School', address: '74-5000 Puohulihuli St, Kailua-Kona, HI 96740', latitude: 19.6656, longitude: -155.9822, island: 'Hawaii', type: 'school' },
  { id: 'hi-shelter-018', name: 'Afook-Chinen Civic Auditorium', address: '323 Manono St, Hilo, HI 96720', latitude: 19.7239, longitude: -155.0867, island: 'Hawaii', type: 'community_center' },
  // Kauai
  { id: 'hi-shelter-019', name: 'Kauai High School', address: '3577 Lala Rd, Lihue, HI 96766', latitude: 21.9750, longitude: -159.3667, island: 'Kauai', type: 'school' },
  { id: 'hi-shelter-020', name: 'Kapaa High School', address: '4695 Mailihuna Rd, Kapaa, HI 96746', latitude: 22.0833, longitude: -159.3333, island: 'Kauai', type: 'school' },
  { id: 'hi-shelter-021', name: 'Kauai War Memorial Convention Hall', address: '4191 Hardy St, Lihue, HI 96766', latitude: 21.9778, longitude: -159.3653, island: 'Kauai', type: 'community_center' },
  // Molokai
  { id: 'hi-shelter-022', name: 'Molokai High School', address: '2140 Farrington Ave, Hoolehua, HI 96729', latitude: 21.1667, longitude: -157.0833, island: 'Molokai', type: 'school' },
];

async function fetchShelters() {
  // Static seed — no external API call during non-disaster periods.
  // During active emergencies, this would be augmented by HI-EMA activation feeds.
  const shelters = SHELTERS.map(s => ({
    ...s,
    status: 'standby',
    capacity: null,
    pets_allowed: null,
    ada_accessible: true,
  }));

  console.log(`  ${shelters.length} shelters across ${new Set(shelters.map(s => s.island)).size} islands`);
  return { shelters, fetchedAt: new Date().toISOString() };
}

function validate(data) {
  return Array.isArray(data?.shelters) && data.shelters.length > 0;
}

runSeed('emergency', 'shelters', CANONICAL_KEY, fetchShelters, {
  validateFn: validate,
  ttlSeconds: CACHE_TTL,
  sourceVersion: 'static-hi-ema-v1',
  recordCount: (d) => d?.shelters?.length || 0,
}).catch((err) => {
  const _cause = err.cause ? ` (cause: ${err.cause.message || err.cause.code || err.cause})` : ''; console.error('FATAL:', (err.message || err) + _cause);
  process.exit(1);
});
