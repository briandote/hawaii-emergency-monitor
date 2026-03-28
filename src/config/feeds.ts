import type { Feed } from '@/types';
import { rssProxyUrl } from '@/utils';

const rss = rssProxyUrl;

// Source tier system for prioritization (lower = more authoritative)
// Tier 1: Wire services - fastest, most reliable breaking news
// Tier 2: Major outlets - high-quality journalism
// Tier 3: Specialty sources - domain expertise
// Tier 4: Aggregators & blogs - useful but less authoritative
export const SOURCE_TIERS: Record<string, number> = {
  // Tier 1 - Wire Services
  'Reuters': 1,
  'AP News': 1,
  'AFP': 1,
  'Bloomberg': 1,

  // Tier 2 - Major Outlets
  'BBC World': 2,
  'BBC Middle East': 2,
  'Guardian World': 2,
  'Guardian ME': 2,
  'NPR News': 2,
  'CNN World': 2,
  'CNBC': 2,
  'MarketWatch': 2,
  'Al Jazeera': 2,
  'Financial Times': 2,
  'Politico': 2,
  'Axios': 2,
  'EuroNews': 2,
  'France 24': 2,
  'Le Monde': 2,
  // Spanish
  'El País': 2,
  'El Mundo': 2,
  'BBC Mundo': 2,
  // German
  'Tagesschau': 1,
  'Der Spiegel': 2,
  'Die Zeit': 2,
  'DW News': 2,
  // Italian
  'ANSA': 1,
  'Corriere della Sera': 2,
  'Repubblica': 2,
  // Dutch
  'NOS Nieuws': 1,
  'NRC': 2,
  'De Telegraaf': 2,
  // Swedish
  'SVT Nyheter': 1,
  'Dagens Nyheter': 2,
  'Svenska Dagbladet': 2,
  'Reuters World': 1,
  'Reuters Business': 1,
  'Reuters US': 1,
  'Fox News': 2,
  'NBC News': 2,
  'CBS News': 2,
  'ABC News': 2,
  'PBS NewsHour': 2,
  'Wall Street Journal': 1,
  'The Hill': 3,
  'The National': 2,
  'Yonhap News': 2,
  'Chosun Ilbo': 2,
  'OpenAI News': 3,
  // Portuguese
  'Brasil Paralelo': 2,

  // Tier 1 - Official Government & International Orgs
  'White House': 1,
  'State Dept': 1,
  'Pentagon': 1,
  'UN News': 1,
  'CISA': 1,
  'Treasury': 2,
  'DOJ': 2,
  'DHS': 2,
  'CDC': 2,
  'FEMA': 2,

  // Tier 3 - Specialty
  'Defense One': 3,
  'Breaking Defense': 3,
  'The War Zone': 3,
  'Defense News': 3,
  'Janes': 3,
  'Military Times': 2,
  'Task & Purpose': 3,
  'USNI News': 2,
  'gCaptain': 3,
  'Oryx OSINT': 2,
  'UK MOD': 1,
  'Foreign Policy': 3,
  'The Diplomat': 3,
  'Bellingcat': 3,
  'Krebs Security': 3,
  'Ransomware.live': 3,
  'Federal Reserve': 3,
  'SEC': 3,
  'MIT Tech Review': 3,
  'Ars Technica': 3,
  'Atlantic Council': 3,
  'Foreign Affairs': 3,
  'CrisisWatch': 3,
  'CSIS': 3,
  'RAND': 3,
  'Brookings': 3,
  'Carnegie': 3,
  'IAEA': 1,
  'WHO': 1,
  'UNHCR': 1,
  'Xinhua': 3,
  'TASS': 3,
  'RT': 3,
  'RT Russia': 3,
  'Layoffs.fyi': 3,
  'BBC Persian': 2,
  'Iran International': 3,
  'Fars News': 3,
  'MIIT (China)': 1,
  'MOFCOM (China)': 1,
  // Turkish
  'BBC Turkce': 2,
  'DW Turkish': 2,
  'Hurriyet': 2,
  // Polish
  'TVN24': 2,
  'Polsat News': 2,
  'Rzeczpospolita': 2,
  // Russian (independent)
  'BBC Russian': 2,
  'Meduza': 2,
  'Novaya Gazeta Europe': 2,
  // Thai
  'Bangkok Post': 2,
  'Thai PBS': 2,
  // Australian
  'ABC News Australia': 2,
  'Guardian Australia': 2,
  // Vietnamese
  'VnExpress': 2,
  'Tuoi Tre News': 2,

  // Tier 2 - Premium Startup/VC Sources
  'Y Combinator Blog': 2,
  'a16z Blog': 2,
  'Sequoia Blog': 2,
  'Crunchbase News': 2,
  'CB Insights': 2,
  'PitchBook News': 2,
  'The Information': 2,

  // Tier 3 - Regional/Specialty Startup Sources
  'EU Startups': 3,
  'Tech.eu': 3,
  'Sifted (Europe)': 3,
  'The Next Web': 3,
  'Tech in Asia': 3,
  'TechCabal (Africa)': 3,
  'Inc42 (India)': 3,
  'YourStory': 3,
  'Paul Graham Essays': 2,
  'Stratechery': 2,
  // Asia - Regional
  'e27 (SEA)': 3,
  'DealStreetAsia': 3,
  'Pandaily (China)': 3,
  '36Kr English': 3,
  'TechNode (China)': 3,
  'China Tech News': 3,
  'The Bridge (Japan)': 3,
  'Japan Tech News': 3,
  'Nikkei Tech': 2,
  'NHK World': 2,
  'Nikkei Asia': 2,
  'Korea Tech News': 3,
  'KED Global': 3,
  'Entrackr (India)': 3,
  'India Tech News': 3,
  'Taiwan Tech News': 3,
  'GloNewswire (Taiwan)': 4,
  // LATAM
  'La Silla Vacía': 3,
  'LATAM Tech News': 3,
  'Startups.co (LATAM)': 3,
  'Contxto (LATAM)': 3,
  'Brazil Tech News': 3,
  'Mexico Tech News': 3,
  'LATAM Fintech': 3,
  // Africa & MENA
  'Wamda (MENA)': 3,
  'Magnitt': 3,
  // Nigeria
  'Premium Times': 2,
  'Vanguard Nigeria': 2,
  'Channels TV': 2,
  'Daily Trust': 3,
  'ThisDay': 2,
  // Greek
  'Kathimerini': 2,
  'Naftemporiki': 2,
  'in.gr': 3,
  'iefimerida': 3,
  'Proto Thema': 3,

  // Tier 3 - Think Tanks
  'Brookings Tech': 3,
  'CSIS Tech': 3,
  'MIT Tech Policy': 3,
  'Stanford HAI': 2,
  'AI Now Institute': 3,
  'OECD Digital': 2,
  'Bruegel (EU)': 3,
  'Chatham House Tech': 3,
  'ISEAS (Singapore)': 3,
  'ORF Tech (India)': 3,
  'RIETI (Japan)': 3,
  'Lowy Institute': 3,
  'China Tech Analysis': 3,
  'DigiChina': 2,
  // Security/Defense Think Tanks
  'RUSI': 2,
  'Wilson Center': 3,
  'GMF': 3,
  'Stimson Center': 3,
  'CNAS': 2,
  // Nuclear & Arms Control
  'Arms Control Assn': 2,
  'Bulletin of Atomic Scientists': 2,
  // Food Security
  'FAO GIEWS': 2,
  'EU ISS': 3,
  // New verified think tanks
  'War on the Rocks': 2,
  'AEI': 3,
  'Responsible Statecraft': 3,
  'FPRI': 3,
  'Jamestown': 3,

  // Tier 3 - Policy Sources
  'Politico Tech': 2,
  'AI Regulation': 3,
  'Tech Antitrust': 3,
  'EFF News': 3,
  'EU Digital Policy': 3,
  'Euractiv Digital': 3,
  'EU Commission Digital': 2,
  'China Tech Policy': 3,
  'UK Tech Policy': 3,
  'India Tech Policy': 3,

  // Tier 2-3 - Podcasts & Newsletters
  'Acquired Podcast': 2,
  'All-In Podcast': 2,
  'a16z Podcast': 2,
  'This Week in Startups': 3,
  'The Twenty Minute VC': 2,
  'Lex Fridman Tech': 3,
  'The Vergecast': 3,
  'Decoder (Verge)': 3,
  'Hard Fork (NYT)': 2,
  'Pivot (Vox)': 2,
  'Benedict Evans': 2,
  'The Pragmatic Engineer': 2,
  'Lenny Newsletter': 2,
  'AI Podcast (NVIDIA)': 3,
  'Gradient Dissent': 3,
  'Eye on AI': 3,
  'How I Built This': 2,
  'Masters of Scale': 2,
  'The Pitch': 3,

  // Tier 4 - Aggregators
  'Hacker News': 4,
  'The Verge': 4,
  'The Verge AI': 4,
  'VentureBeat AI': 4,
  'Yahoo Finance': 4,
  'TechCrunch Layoffs': 4,
  'ArXiv AI': 4,
  'AI News': 4,
  'Layoffs News': 4,

  // Tier 2 - Positive News Sources (Happy variant)
  'Good News Network': 2,
  'Positive.News': 2,
  'Reasons to be Cheerful': 2,
  'Optimist Daily': 2,
  'Yes! Magazine': 2,
  'My Modern Met': 2,
  'Upworthy': 3,
  'DailyGood': 3,
  'Good Good Good': 3,
  'GOOD Magazine': 3,
  'Sunny Skyz': 3,
  'The Better India': 3,
  'Mongabay': 3,
  'Conservation Optimism': 3,
  'Shareable': 3,
  'GNN Heroes Spotlight': 3,
  'GNN Science': 3,
  'GNN Animals': 3,
  'GNN Health': 3,
  'GNN Heroes': 3,
  'GNN Earth': 3,

  // Tier 1-2 - Emergency Sources (Emergency variant)
  'NWS Hawaii': 1,
  'HI-EMA': 1,
  'NWS Honolulu Discussion': 1,
  'Civil Beat': 2,
  'Hawaii News Now': 2,
  'Maui Now': 3,
  'Big Island Now': 3,
  'Kauai Now': 3,
  'Honolulu Emergency': 3,
  'Maui Emergency': 3,
  'Hawaii County Emergency': 3,
  'Kauai Emergency': 3,
};

export function getSourceTier(sourceName: string): number {
  return SOURCE_TIERS[sourceName] ?? 4; // Default to tier 4 if unknown
}

export type SourceType = 'wire' | 'gov' | 'intel' | 'mainstream' | 'market' | 'tech' | 'other';

export const SOURCE_TYPES: Record<string, SourceType> = {
  // Wire services - fastest, most authoritative
  'Reuters': 'wire', 'Reuters World': 'wire', 'Reuters Business': 'wire',
  'AP News': 'wire', 'AFP': 'wire', 'Bloomberg': 'wire',

  // Government & International Org sources
  'White House': 'gov', 'State Dept': 'gov', 'Pentagon': 'gov',
  'Treasury': 'gov', 'DOJ': 'gov', 'DHS': 'gov', 'CDC': 'gov',
  'FEMA': 'gov', 'Federal Reserve': 'gov', 'SEC': 'gov',
  'UN News': 'gov', 'CISA': 'gov',

  // Intel/Defense specialty
  'Defense One': 'intel', 'Breaking Defense': 'intel', 'The War Zone': 'intel',
  'Defense News': 'intel', 'Janes': 'intel', 'Military Times': 'intel', 'Task & Purpose': 'intel',
  'USNI News': 'intel', 'gCaptain': 'intel', 'Oryx OSINT': 'intel', 'UK MOD': 'gov',
  'Bellingcat': 'intel', 'Krebs Security': 'intel',
  'Foreign Policy': 'intel', 'The Diplomat': 'intel',
  'Atlantic Council': 'intel', 'Foreign Affairs': 'intel',
  'CrisisWatch': 'intel',
  'CSIS': 'intel', 'RAND': 'intel', 'Brookings': 'intel', 'Carnegie': 'intel',
  'IAEA': 'gov', 'WHO': 'gov', 'UNHCR': 'gov',
  'Xinhua': 'wire', 'TASS': 'wire', 'RT': 'wire', 'RT Russia': 'wire',
  'NHK World': 'mainstream', 'Nikkei Asia': 'market',

  // Mainstream outlets
  'BBC World': 'mainstream', 'BBC Middle East': 'mainstream',
  'Guardian World': 'mainstream', 'Guardian ME': 'mainstream',
  'NPR News': 'mainstream', 'Al Jazeera': 'mainstream',
  'CNN World': 'mainstream', 'Politico': 'mainstream', 'Axios': 'mainstream',
  'EuroNews': 'mainstream', 'France 24': 'mainstream', 'Le Monde': 'mainstream',
  // European Addition
  'El País': 'mainstream', 'El Mundo': 'mainstream', 'BBC Mundo': 'mainstream',
  'Tagesschau': 'mainstream', 'Der Spiegel': 'mainstream', 'Die Zeit': 'mainstream', 'DW News': 'mainstream',
  'ANSA': 'wire', 'Corriere della Sera': 'mainstream', 'Repubblica': 'mainstream',
  'NOS Nieuws': 'mainstream', 'NRC': 'mainstream', 'De Telegraaf': 'mainstream',
  'SVT Nyheter': 'mainstream', 'Dagens Nyheter': 'mainstream', 'Svenska Dagbladet': 'mainstream',
  // Brazilian Addition
  'Brasil Paralelo': 'mainstream',

  // Market/Finance
  'CNBC': 'market', 'MarketWatch': 'market', 'Yahoo Finance': 'market',
  'Financial Times': 'market',

  // Tech
  'Hacker News': 'tech', 'Ars Technica': 'tech', 'The Verge': 'tech',
  'The Verge AI': 'tech', 'MIT Tech Review': 'tech', 'TechCrunch Layoffs': 'tech',
  'AI News': 'tech', 'ArXiv AI': 'tech', 'VentureBeat AI': 'tech',
  'Layoffs.fyi': 'tech', 'Layoffs News': 'tech',

  // Regional Tech Startups
  'EU Startups': 'tech', 'Tech.eu': 'tech', 'Sifted (Europe)': 'tech',
  'The Next Web': 'tech', 'Tech in Asia': 'tech', 'e27 (SEA)': 'tech',
  'DealStreetAsia': 'tech', 'Pandaily (China)': 'tech', '36Kr English': 'tech',
  'TechNode (China)': 'tech', 'The Bridge (Japan)': 'tech', 'Nikkei Tech': 'tech',
  'Inc42 (India)': 'tech', 'YourStory': 'tech', 'TechCabal (Africa)': 'tech',
  'Wamda (MENA)': 'tech', 'Magnitt': 'tech',

  // Think Tanks & Policy
  'Brookings Tech': 'intel', 'CSIS Tech': 'intel', 'Stanford HAI': 'intel',
  'AI Now Institute': 'intel', 'OECD Digital': 'intel', 'Bruegel (EU)': 'intel',
  'Chatham House Tech': 'intel', 'DigiChina': 'intel', 'Lowy Institute': 'intel',
  'EFF News': 'intel', 'Politico Tech': 'intel',
  // Security/Defense Think Tanks
  'RUSI': 'intel', 'Wilson Center': 'intel', 'GMF': 'intel',
  'Stimson Center': 'intel', 'CNAS': 'intel',
  // Nuclear & Arms Control
  'Arms Control Assn': 'intel', 'Bulletin of Atomic Scientists': 'intel',
  // Food Security & Regional
  'FAO GIEWS': 'gov', 'EU ISS': 'intel',
  // New verified think tanks
  'War on the Rocks': 'intel', 'AEI': 'intel', 'Responsible Statecraft': 'intel',
  'FPRI': 'intel', 'Jamestown': 'intel',

  // Podcasts & Newsletters
  'Acquired Podcast': 'tech', 'All-In Podcast': 'tech', 'a16z Podcast': 'tech',
  'This Week in Startups': 'tech', 'The Twenty Minute VC': 'tech',
  'Hard Fork (NYT)': 'tech', 'Pivot (Vox)': 'tech', 'Stratechery': 'tech',
  'Benedict Evans': 'tech', 'How I Built This': 'tech', 'Masters of Scale': 'tech',
};

export function getSourceType(sourceName: string): SourceType {
  return SOURCE_TYPES[sourceName] ?? 'other';
}

// Propaganda risk assessment for sources (Quick Win #5)
// 'high' = State-controlled media, known to push government narratives
// 'medium' = State-affiliated or known editorial bias toward specific governments
// 'low' = Independent journalism with editorial standards
export type PropagandaRisk = 'low' | 'medium' | 'high';

export interface SourceRiskProfile {
  risk: PropagandaRisk;
  stateAffiliated?: string;
  knownBiases?: string[];
  note?: string;
}

export const SOURCE_PROPAGANDA_RISK: Record<string, SourceRiskProfile> = {
  // High risk - State-controlled media
  'Xinhua': { risk: 'high', stateAffiliated: 'China', note: 'Official CCP news agency' },
  'TASS': { risk: 'high', stateAffiliated: 'Russia', note: 'Russian state news agency' },
  'RT': { risk: 'high', stateAffiliated: 'Russia', note: 'Russian state media, banned in EU' },
  'RT Russia': { risk: 'high', stateAffiliated: 'Russia', note: 'Russian state media, Russia desk' },
  'Sputnik': { risk: 'high', stateAffiliated: 'Russia', note: 'Russian state media' },
  'CGTN': { risk: 'high', stateAffiliated: 'China', note: 'Chinese state broadcaster' },
  'Press TV': { risk: 'high', stateAffiliated: 'Iran', note: 'Iranian state media' },
  'KCNA': { risk: 'high', stateAffiliated: 'North Korea', note: 'North Korean state media' },

  // Medium risk - State-affiliated or known bias
  'Al Jazeera': { risk: 'medium', stateAffiliated: 'Qatar', note: 'Qatari state-funded, independent editorial' },
  'Al Arabiya': { risk: 'medium', stateAffiliated: 'Saudi Arabia', note: 'Saudi-owned, reflects Gulf perspective' },
  'TRT World': { risk: 'medium', stateAffiliated: 'Turkey', note: 'Turkish state broadcaster' },
  'France 24': { risk: 'medium', stateAffiliated: 'France', note: 'French state-funded, editorially independent' },
  'EuroNews': { risk: 'low', note: 'European public broadcaster consortium', knownBiases: ['Pro-EU'] },
  'Le Monde': { risk: 'low', note: 'French newspaper of record' },
  'DW News': { risk: 'medium', stateAffiliated: 'Germany', note: 'German state-funded, editorially independent' },
  'Voice of America': { risk: 'medium', stateAffiliated: 'USA', note: 'US government-funded' },
  'Kyiv Independent': { risk: 'medium', knownBiases: ['Pro-Ukraine'], note: 'Ukrainian perspective on Russia-Ukraine war' },
  'Moscow Times': { risk: 'medium', knownBiases: ['Anti-Kremlin'], note: 'Independent, critical of Russian government' },

  // Low risk - Independent with editorial standards (explicit)
  'Reuters': { risk: 'low', note: 'Wire service, strict editorial standards' },
  'AP News': { risk: 'low', note: 'Wire service, nonprofit cooperative' },
  'AFP': { risk: 'low', note: 'Wire service, editorially independent' },
  'BBC World': { risk: 'low', note: 'Public broadcaster, editorial independence charter' },
  'BBC Middle East': { risk: 'low', note: 'Public broadcaster, editorial independence charter' },
  'Guardian World': { risk: 'low', knownBiases: ['Center-left'], note: 'Scott Trust ownership, no shareholders' },
  'Financial Times': { risk: 'low', note: 'Business focus, Nikkei-owned' },
  'Bellingcat': { risk: 'low', note: 'Open-source investigations, methodology transparent' },
  'Brasil Paralelo': { risk: 'low', note: 'Independent media company: no political ties, no public funding, 100% subscriber-funded.' },
};

export function getSourcePropagandaRisk(sourceName: string): SourceRiskProfile {
  return SOURCE_PROPAGANDA_RISK[sourceName] ?? { risk: 'low' };
}

export function isStateAffiliatedSource(sourceName: string): boolean {
  const profile = SOURCE_PROPAGANDA_RISK[sourceName];
  return !!profile?.stateAffiliated;
}

let _sourcePanelMap: Map<string, string> | null = null;
export function getSourcePanelId(sourceName: string): string {
  if (!_sourcePanelMap) {
    _sourcePanelMap = new Map();
    for (const [category, feeds] of Object.entries(FEEDS)) {
      for (const feed of feeds) _sourcePanelMap.set(feed.name, category);
    }
    for (const feed of INTEL_SOURCES) _sourcePanelMap.set(feed.name, 'intel');
  }
  return _sourcePanelMap.get(sourceName) ?? 'politics';
}

const EMERGENCY_FEEDS: Record<string, Feed[]> = {
  alerts: [
    { name: 'NWS Hawaii', url: rss('https://api.weather.gov/alerts/active.atom?area=HI') },
    { name: 'HI-EMA', url: rss('https://dod.hawaii.gov/hiema/feed/') },
  ],
  'local-news': [
    { name: 'Hawaii News Now', url: rss('https://news.google.com/rss/search?q=site:hawaiinewsnow.com+when:1d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Civil Beat', url: rss('https://www.civilbeat.org/feed/') },
    { name: 'Maui Now', url: rss('https://mauinow.com/feed/') },
    { name: 'Big Island Now', url: rss('https://bigislandnow.com/feed/') },
    { name: 'Kauai Now', url: rss('https://news.google.com/rss/search?q=site:kauainow.com+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  weather: [
    { name: 'NWS Honolulu', url: rss('https://www.weather.gov/rss_page.php?site_name=hfo') },
    { name: 'Hawaii Weather News', url: rss('https://news.google.com/rss/search?q=NWS+Honolulu+OR+"Hawaii+weather"+forecast+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
  county: [
    { name: 'Honolulu Emergency', url: rss('https://news.google.com/rss/search?q=("Honolulu+emergency"+OR+"Oahu+emergency"+OR+"Honolulu+evacuation")+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Maui Emergency', url: rss('https://news.google.com/rss/search?q=("Maui+emergency"+OR+"Maui+evacuation"+OR+"Maui+disaster")+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Hawaii County Emergency', url: rss('https://news.google.com/rss/search?q=("Hawaii+County+emergency"+OR+"Big+Island+emergency"+OR+"Hilo+evacuation")+when:3d&hl=en-US&gl=US&ceid=US:en') },
    { name: 'Kauai Emergency', url: rss('https://news.google.com/rss/search?q=("Kauai+emergency"+OR+"Kauai+evacuation"+OR+"Kauai+disaster")+when:3d&hl=en-US&gl=US&ceid=US:en') },
  ],
};

// Emergency feeds only
export const FEEDS = EMERGENCY_FEEDS;

export const SOURCE_REGION_MAP: Record<string, { labelKey: string; feedKeys: string[] }> = {
  // Full (geopolitical) variant regions
  worldwide: { labelKey: 'header.sourceRegionWorldwide', feedKeys: ['politics', 'crisis'] },
  us: { labelKey: 'header.sourceRegionUS', feedKeys: ['us', 'gov'] },
  europe: { labelKey: 'header.sourceRegionEurope', feedKeys: ['europe'] },
  middleeast: { labelKey: 'header.sourceRegionMiddleEast', feedKeys: ['middleeast'] },
  africa: { labelKey: 'header.sourceRegionAfrica', feedKeys: ['africa'] },
  latam: { labelKey: 'header.sourceRegionLatAm', feedKeys: ['latam'] },
  asia: { labelKey: 'header.sourceRegionAsiaPacific', feedKeys: ['asia'] },
  topical: { labelKey: 'header.sourceRegionTopical', feedKeys: ['energy', 'tech', 'ai', 'finance', 'layoffs', 'thinktanks'] },
  intel: { labelKey: 'header.sourceRegionIntel', feedKeys: [] },

  // Tech variant regions
  techNews: { labelKey: 'header.sourceRegionTechNews', feedKeys: ['tech', 'hardware'] },
  aiMl: { labelKey: 'header.sourceRegionAiMl', feedKeys: ['ai'] },
  startupsVc: { labelKey: 'header.sourceRegionStartupsVc', feedKeys: ['startups', 'vcblogs', 'funding', 'unicorns', 'accelerators', 'ipo'] },
  regionalTech: { labelKey: 'header.sourceRegionRegionalTech', feedKeys: ['regionalStartups'] },
  developer: { labelKey: 'header.sourceRegionDeveloper', feedKeys: ['github', 'cloud', 'dev', 'producthunt', 'outages'] },
  cybersecurity: { labelKey: 'header.sourceRegionCybersecurity', feedKeys: ['security'] },
  techPolicy: { labelKey: 'header.sourceRegionTechPolicy', feedKeys: ['policy', 'thinktanks'] },
  techMedia: { labelKey: 'header.sourceRegionTechMedia', feedKeys: ['podcasts', 'layoffs', 'finance'] },

  // Finance variant regions
  marketsAnalysis: { labelKey: 'header.sourceRegionMarkets', feedKeys: ['markets', 'analysis', 'ipo'] },
  fixedIncomeFx: { labelKey: 'header.sourceRegionFixedIncomeFx', feedKeys: ['forex', 'bonds'] },
  commoditiesRegion: { labelKey: 'header.sourceRegionCommodities', feedKeys: ['commodities'] },
  cryptoDigital: { labelKey: 'header.sourceRegionCryptoDigital', feedKeys: ['crypto', 'fintech'] },
  centralBanksEcon: { labelKey: 'header.sourceRegionCentralBanks', feedKeys: ['centralbanks', 'economic'] },
  dealsCorpFin: { labelKey: 'header.sourceRegionDeals', feedKeys: ['institutional', 'derivatives'] },
  finRegulation: { labelKey: 'header.sourceRegionFinRegulation', feedKeys: ['regulation'] },
  gulfMena: { labelKey: 'header.sourceRegionGulfMena', feedKeys: ['gccNews'] },

  // Emergency variant regions
  emergencyAlerts: { labelKey: 'header.sourceRegionEmergencyAlerts', feedKeys: ['alerts'] },
  emergencyNews: { labelKey: 'header.sourceRegionEmergencyNews', feedKeys: ['local-news'] },
  emergencyWeather: { labelKey: 'header.sourceRegionEmergencyWeather', feedKeys: ['weather'] },
  emergencyCounty: { labelKey: 'header.sourceRegionEmergencyCounty', feedKeys: ['county'] },
};

export const INTEL_SOURCES: Feed[] = [
  // Defense & Security (Tier 1)
  { name: 'Defense One', url: rss('https://www.defenseone.com/rss/all/'), type: 'defense' },
  { name: 'The War Zone', url: rss('https://www.twz.com/feed'), type: 'defense' },
  { name: 'Defense News', url: rss('https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml'), type: 'defense' },
  { name: 'Janes', url: rss('https://news.google.com/rss/search?q=site:janes.com+when:3d&hl=en-US&gl=US&ceid=US:en'), type: 'defense' },
  { name: 'Military Times', url: rss('https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml'), type: 'defense' },
  { name: 'Task & Purpose', url: rss('https://taskandpurpose.com/feed/'), type: 'defense' },
  { name: 'USNI News', url: rss('https://news.google.com/rss/search?q=site:news.usni.org+when:3d&hl=en-US&gl=US&ceid=US:en'), type: 'defense' },
  { name: 'gCaptain', url: rss('https://gcaptain.com/feed/'), type: 'defense' },
  { name: 'Oryx OSINT', url: rss('https://www.oryxspioenkop.com/feeds/posts/default?alt=rss'), type: 'defense' },
  { name: 'UK MOD', url: rss('https://www.gov.uk/government/organisations/ministry-of-defence.atom'), type: 'defense' },
  { name: 'CSIS', url: rss('https://news.google.com/rss/search?q=site:csis.org&hl=en&gl=US&ceid=US:en'), type: 'defense' },

  // International Relations (Tier 2)
  { name: 'Chatham House', url: rss('https://news.google.com/rss/search?q=site:chathamhouse.org+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'intl' },
  { name: 'ECFR', url: rss('https://news.google.com/rss/search?q=site:ecfr.eu+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'intl' },
  { name: 'Foreign Policy', url: rss('https://foreignpolicy.com/feed/'), type: 'intl' },
  { name: 'Foreign Affairs', url: rss('https://www.foreignaffairs.com/rss.xml'), type: 'intl' },
  { name: 'Atlantic Council', url: rss('https://www.atlanticcouncil.org/feed/'), type: 'intl' },
  { name: 'Middle East Institute', url: rss('https://news.google.com/rss/search?q=site:mei.edu+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'intl' },

  // Think Tanks & Research (Tier 3)
  { name: 'RAND', url: rss('https://www.rand.org/pubs/articles.xml'), type: 'research' },
  { name: 'Brookings', url: rss('https://news.google.com/rss/search?q=site:brookings.edu&hl=en&gl=US&ceid=US:en'), type: 'research' },
  { name: 'Carnegie', url: rss('https://news.google.com/rss/search?q=site:carnegieendowment.org&hl=en&gl=US&ceid=US:en'), type: 'research' },
  { name: 'FAS', url: rss('https://news.google.com/rss/search?q=site:fas.org+nuclear+weapons+security&hl=en&gl=US&ceid=US:en'), type: 'research' },
  { name: 'NTI', url: rss('https://news.google.com/rss/search?q=site:nti.org+when:30d&hl=en-US&gl=US&ceid=US:en'), type: 'research' },
  { name: 'RUSI', url: rss('https://news.google.com/rss/search?q=site:rusi.org+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'research' },
  { name: 'Wilson Center', url: rss('https://news.google.com/rss/search?q=site:wilsoncenter.org+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'research' },
  { name: 'GMF', url: rss('https://news.google.com/rss/search?q=site:gmfus.org+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'research' },
  { name: 'Stimson Center', url: rss('https://www.stimson.org/feed/'), type: 'research' },
  { name: 'CNAS', url: rss('https://news.google.com/rss/search?q=site:cnas.org+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'research' },
  { name: 'Lowy Institute', url: rss('https://news.google.com/rss/search?q=site:lowyinstitute.org+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'research' },

  // Nuclear & Arms Control (Tier 2)
  { name: 'Arms Control Assn', url: rss('https://news.google.com/rss/search?q=site:armscontrol.org+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'nuclear' },
  { name: 'Bulletin of Atomic Scientists', url: rss('https://news.google.com/rss/search?q=site:thebulletin.org+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'nuclear' },

  // OSINT & Monitoring (Tier 2)
  { name: 'Bellingcat', url: rss('https://news.google.com/rss/search?q=site:bellingcat.com+when:30d&hl=en-US&gl=US&ceid=US:en'), type: 'osint' },
  { name: 'Krebs Security', url: rss('https://krebsonsecurity.com/feed/'), type: 'cyber' },
  { name: 'Ransomware.live', url: rss('https://www.ransomware.live/rss.xml'), type: 'cyber' },

  // Economic & Food Security (Tier 2)
  { name: 'FAO News', url: rss('https://www.fao.org/feeds/fao-newsroom-rss'), type: 'economic' },
  { name: 'FAO GIEWS', url: rss('https://news.google.com/rss/search?q=site:fao.org+GIEWS+food+security+when:30d&hl=en-US&gl=US&ceid=US:en'), type: 'economic' },
  { name: 'EU ISS', url: rss('https://news.google.com/rss/search?q=site:iss.europa.eu+when:7d&hl=en-US&gl=US&ceid=US:en'), type: 'intl' },
];

// Default-enabled sources per panel (Tier 1+2 priority, ≥8 per panel)
export const DEFAULT_ENABLED_SOURCES: Record<string, string[]> = {
  politics: ['BBC World', 'Guardian World', 'AP News', 'Reuters World', 'CNN World'],
  us: ['Reuters US', 'NPR News', 'PBS NewsHour', 'ABC News', 'CBS News', 'NBC News', 'Wall Street Journal', 'Politico', 'The Hill'],
  europe: ['France 24', 'EuroNews', 'Le Monde', 'DW News', 'Tagesschau', 'ANSA', 'NOS Nieuws', 'SVT Nyheter'],
  middleeast: ['BBC Middle East', 'Al Jazeera', 'Al Arabiya', 'Guardian ME', 'BBC Persian', 'Iran International', 'Haaretz', 'Asharq News', 'The National'],
  africa: ['BBC Africa', 'News24', 'Africanews', 'Jeune Afrique', 'Africa News', 'Premium Times', 'Channels TV', 'Sahel Crisis'],
  latam: ['BBC Latin America', 'Reuters LatAm', 'InSight Crime', 'Mexico News Daily', 'Clarín', 'Primicias', 'Infobae Americas', 'El Universo'],
  asia: ['BBC Asia', 'The Diplomat', 'South China Morning Post', 'Reuters Asia', 'Nikkei Asia', 'CNA', 'Asia News', 'The Hindu'],
  tech: ['Hacker News', 'Ars Technica', 'The Verge', 'MIT Tech Review'],
  ai: ['AI News', 'VentureBeat AI', 'The Verge AI', 'MIT Tech Review', 'ArXiv AI'],
  finance: ['CNBC', 'MarketWatch', 'Yahoo Finance', 'Financial Times', 'Reuters Business'],
  gov: ['White House', 'State Dept', 'Pentagon', 'UN News', 'CISA', 'Treasury', 'DOJ', 'CDC'],
  layoffs: ['Layoffs.fyi', 'TechCrunch Layoffs', 'Layoffs News'],
  thinktanks: ['Foreign Policy', 'Atlantic Council', 'Foreign Affairs', 'CSIS', 'RAND', 'Brookings', 'Carnegie', 'War on the Rocks'],
  crisis: ['CrisisWatch', 'IAEA', 'WHO', 'UNHCR'],
  energy: ['Oil & Gas', 'Nuclear Energy', 'Reuters Energy', 'Mining & Resources'],
};

export const DEFAULT_ENABLED_INTEL: string[] = [
  'Defense One', 'Breaking Defense', 'The War Zone', 'Defense News',
  'Military Times', 'USNI News', 'Bellingcat', 'Krebs Security',
];

export function getAllDefaultEnabledSources(): Set<string> {
  const s = new Set<string>();
  for (const names of Object.values(DEFAULT_ENABLED_SOURCES)) names.forEach(n => s.add(n));
  DEFAULT_ENABLED_INTEL.forEach(n => s.add(n));
  return s;
}

/** Sources boosted by locale (feeds tagged with matching `lang` or multi-URL key). */
export function getLocaleBoostedSources(locale: string): Set<string> {
  const lang = (locale.split('-')[0] ?? 'en').toLowerCase();
  const boosted = new Set<string>();
  if (lang === 'en') return boosted;
  const allFeeds = [...Object.values(EMERGENCY_FEEDS).flat(), ...INTEL_SOURCES];
  for (const f of allFeeds) {
    if (f.lang === lang) boosted.add(f.name);
    if (typeof f.url === 'object' && lang in f.url) boosted.add(f.name);
  }
  return boosted;
}

export function computeDefaultDisabledSources(locale?: string): string[] {
  const enabled = getAllDefaultEnabledSources();
  if (locale) {
    for (const name of getLocaleBoostedSources(locale)) enabled.add(name);
  }
  const all = new Set<string>();
  for (const feeds of Object.values(EMERGENCY_FEEDS)) for (const f of feeds) all.add(f.name);
  for (const f of INTEL_SOURCES) all.add(f.name);
  return [...all].filter(name => !enabled.has(name));
}

export function getTotalFeedCount(): number {
  const all = new Set<string>();
  for (const feeds of Object.values(EMERGENCY_FEEDS)) for (const f of feeds) all.add(f.name);
  for (const f of INTEL_SOURCES) all.add(f.name);
  return all.size;
}

if (import.meta.env.DEV) {
  const allFeedNames = new Set<string>();
  for (const feeds of Object.values(EMERGENCY_FEEDS)) for (const f of feeds) allFeedNames.add(f.name);
  for (const f of INTEL_SOURCES) allFeedNames.add(f.name);
  const defaultEnabled = getAllDefaultEnabledSources();
  for (const name of defaultEnabled) {
    if (!allFeedNames.has(name)) console.error(`[feeds] DEFAULT_ENABLED name "${name}" not found in EMERGENCY_FEEDS!`);
  }
  console.log(`[feeds] ${defaultEnabled.size} unique default-enabled sources / ${allFeedNames.size} total`);
}

// Keywords that trigger alert status - must be specific to avoid false positives
export const ALERT_KEYWORDS = [
  'war', 'invasion', 'military', 'nuclear', 'sanctions', 'missile',
  'airstrike', 'drone strike', 'troops deployed', 'armed conflict', 'bombing', 'casualties',
  'ceasefire', 'peace treaty', 'nato', 'coup', 'martial law',
  'assassination', 'terrorist', 'terror attack', 'cyber attack', 'hostage', 'evacuation order',
];

// Patterns that indicate non-alert content (lifestyle, entertainment, etc.)
export const ALERT_EXCLUSIONS = [
  'protein', 'couples', 'relationship', 'dating', 'diet', 'fitness',
  'recipe', 'cooking', 'shopping', 'fashion', 'celebrity', 'movie',
  'tv show', 'sports', 'game', 'concert', 'festival', 'wedding',
  'vacation', 'travel tips', 'life hack', 'self-care', 'wellness',
];
