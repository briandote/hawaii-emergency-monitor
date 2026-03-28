// Configuration exports — emergency variant only

export { SITE_VARIANT } from './variant';

// Shared base configuration (always included)
export {
  IDLE_PAUSE_MS,
  REFRESH_INTERVALS,
  MONITOR_COLORS,
  STORAGE_KEYS,
} from './variants/base';

// Market data (shared — kept for type compatibility)
export { SECTORS, COMMODITIES, MARKET_SYMBOLS, CRYPTO_MAP } from './markets';

// Geo data (shared base)
export { UNDERSEA_CABLES, MAP_URLS } from './geo';

// AI Datacenters (shared)
export { AI_DATA_CENTERS } from './ai-datacenters';

// Feeds configuration
export {
  SOURCE_TIERS,
  getSourceTier,
  SOURCE_TYPES,
  getSourceType,
  getSourcePropagandaRisk,
  ALERT_KEYWORDS,
  ALERT_EXCLUSIONS,
  type SourceRiskProfile,
  type SourceType,
} from './feeds';

// Panel configuration
export {
  DEFAULT_PANELS,
  DEFAULT_MAP_LAYERS,
  MOBILE_DEFAULT_MAP_LAYERS,
  LAYER_TO_SOURCE,
  ALL_PANELS,
  VARIANT_DEFAULTS,
  VARIANT_PANEL_OVERRIDES,
  getEffectivePanelConfig,
  isPanelEntitled,
  FREE_MAX_PANELS,
  FREE_MAX_SOURCES,
} from './panels';

// Feed exports
export {
  FEEDS,
  INTEL_SOURCES,
} from './feeds';

// Geo data (kept for map layer compatibility)
export {
  INTEL_HOTSPOTS,
  CONFLICT_ZONES,

  MILITARY_BASES,
  NUCLEAR_FACILITIES,
  STRATEGIC_WATERWAYS,
  ECONOMIC_CENTERS,
  SANCTIONED_COUNTRIES,
  SANCTIONED_COUNTRIES_ALPHA2,
  SPACEPORTS,
  CRITICAL_MINERALS,
} from './geo';

export { APT_GROUPS } from './apt-groups';
export { GAMMA_IRRADIATORS } from './irradiators';
export { PIPELINES, PIPELINE_COLORS } from './pipelines';
export { PORTS } from './ports';
export { MONITORED_AIRPORTS, FAA_AIRPORTS } from './airports';
export {
  ENTITY_REGISTRY,
  getEntityById,
  type EntityType,
  type EntityEntry,
} from './entities';

// Tech variant exports (kept for type compatibility, tree-shaken if unused)
export { TECH_COMPANIES } from './tech-companies';
export { AI_RESEARCH_LABS } from './ai-research-labs';
export { STARTUP_ECOSYSTEMS } from './startup-ecosystems';
// AI regulations removed for emergency variant
export {
  STARTUP_HUBS,
  ACCELERATORS,
  TECH_HQS,
  CLOUD_REGIONS,
  type StartupHub,
  type Accelerator,
  type TechHQ,
  type CloudRegion,
} from './tech-geo';

// Finance variant exports (kept for type compatibility, tree-shaken if unused)
export {
  STOCK_EXCHANGES,
  FINANCIAL_CENTERS,
  CENTRAL_BANKS,
  COMMODITY_HUBS,
  type StockExchange,
  type FinancialCenter,
  type CentralBank,
  type CommodityHub,
} from './finance-geo';

export { GULF_INVESTMENTS } from './gulf-fdi';

// Commodity variant exports (kept for map layer compatibility)
export {
  COMMODITY_PRICES,
  COMMODITY_MARKET_SYMBOLS,
} from './commodity-markets';

export {
  MINING_SITES,
  PROCESSING_PLANTS,
  COMMODITY_PORTS,
} from './commodity-geo';
