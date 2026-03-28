import type { InternetOutage, SocialUnrestEvent, MilitaryFlight, MilitaryFlightCluster, MilitaryVessel, MilitaryVesselCluster, USNIFleetReport, PanelConfig, MapLayers, NewsItem, MarketData, ClusteredEvent, CyberThreat, Monitor } from '@/types';
import type { AirportDelayAlert, PositionSample } from '@/services/aviation';
import type { IranEvent } from '@/generated/client/worldmonitor/conflict/v1/service_client';
import type { SanctionsPressureResult } from '@/services/sanctions-pressure';
import type { RadiationWatchResult } from '@/services/radiation';
import type { SecurityAdvisory } from '@/services/security-advisories';
import type { Earthquake } from '@/services/earthquakes';

export type { CountryBriefSignals } from '@/types';

export interface IntelligenceCache {
  flightDelays?: AirportDelayAlert[];
  thermalEscalation?: import('@/services/thermal-escalation').ThermalEscalationWatch;
  aircraftPositions?: PositionSample[];
  outages?: InternetOutage[];
  protests?: { events: SocialUnrestEvent[]; sources: { acled: number; gdelt: number } };
  military?: { flights: MilitaryFlight[]; flightClusters: MilitaryFlightCluster[]; vessels: MilitaryVessel[]; vesselClusters: MilitaryVesselCluster[] };
  earthquakes?: Earthquake[];
  usniFleet?: USNIFleetReport;
  iranEvents?: IranEvent[];
  orefAlerts?: { alertCount: number; historyCount24h: number };
  advisories?: SecurityAdvisory[];
  sanctions?: SanctionsPressureResult;
  radiation?: RadiationWatchResult;
  imageryScenes?: Array<{ id: string; satellite: string; datetime: string; resolutionM: number; mode: string; geometryGeojson: string; previewUrl: string; assetUrl: string }>;
}

export interface AppContext {
  map: import('@/components').MapContainer | null;
  readonly isMobile: boolean;
  readonly isDesktopApp: boolean;
  readonly container: HTMLElement;

  panels: Record<string, import('@/components').Panel>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newsPanels: Record<string, any>;
  panelSettings: Record<string, PanelConfig>;

  mapLayers: MapLayers;

  allNews: NewsItem[];
  newsByCategory: Record<string, NewsItem[]>;
  latestMarkets: MarketData[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  latestPredictions: any[];
  latestClusters: ClusteredEvent[];
  intelligenceCache: IntelligenceCache;
  cyberThreatsCache: CyberThreat[] | null;

  disabledSources: Set<string>;
  currentTimeRange: import('@/components').TimeRange;

  inFlight: Set<string>;
  seenGeoAlerts: Set<string>;
  monitors: Monitor[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signalModal: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statusPanel: any;
  searchModal: import('@/components').SearchModal | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findingsBadge: any;
  breakingBanner: import('@/components/BreakingNewsBanner').BreakingNewsBanner | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playbackControl: any;
  exportPanel: import('@/utils').ExportPanel | null;
  unifiedSettings: import('@/components/UnifiedSettings').UnifiedSettings | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pizzintIndicator: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  correlationEngine: any;
  llmStatusIndicator: import('@/components').LlmStatusIndicator | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countryBriefPage: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countryTimeline: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  positivePanel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countersPanel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  progressPanel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  breakthroughsPanel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heroPanel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  digestPanel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  speciesPanel: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renewablePanel: any;

  activeAlertsPanel: import('@/components/ActiveAlertsPanel').ActiveAlertsPanel | null;
  shelterMapPanel: import('@/components/ShelterMapPanel').ShelterMapPanel | null;
  streamGaugePanel: import('@/components/StreamGaugePanel').StreamGaugePanel | null;
  roadClosurePanel: import('@/components/RoadClosurePanel').RoadClosurePanel | null;
  powerOutagePanel: import('@/components/PowerOutagePanel').PowerOutagePanel | null;

  authModal: { open(): void; close(): void; destroy(): void } | null;
  authHeaderWidget: import('@/components/AuthHeaderWidget').AuthHeaderWidget | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tvMode: any;
  happyAllItems: NewsItem[];
  isDestroyed: boolean;
  isPlaybackMode: boolean;
  isIdle: boolean;
  initialLoadComplete: boolean;
  resolvedLocation: 'global' | 'america' | 'mena' | 'eu' | 'asia' | 'latam' | 'africa' | 'oceania';

  initialUrlState: import('@/utils').ParsedMapUrlState | null;
  readonly PANEL_ORDER_KEY: string;
  readonly PANEL_SPANS_KEY: string;
}

export interface AppModule {
  init(): void | Promise<void>;
  destroy(): void;
}
