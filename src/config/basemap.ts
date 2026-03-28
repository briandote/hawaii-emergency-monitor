const CARTO_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const CARTO_LIGHT = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

export function getDarkStyle(): string {
  return CARTO_DARK;
}

export function getLightStyle(): string {
  return CARTO_LIGHT;
}

export function isLightMapTheme(mapTheme: string): boolean {
  return ['light', 'positron', 'voyager'].includes(mapTheme);
}

// Legacy exports for compatibility — all resolve to CARTO
export type MapProvider = 'carto';
export type PMTilesTheme = string;
export const FALLBACK_DARK_STYLE = CARTO_DARK;
export const FALLBACK_LIGHT_STYLE = CARTO_LIGHT;
export function registerPMTilesProtocol(): void { /* no-op */ }
export function getMapProvider(): MapProvider { return 'carto'; }
export function getMapTheme(_provider: MapProvider): string { return 'dark-matter'; }
export function getStyleForProvider(_provider: MapProvider, _mapTheme: string): string { return CARTO_DARK; }
export function setMapProvider(_provider: MapProvider): void { /* no-op */ }
export function setMapTheme(_provider: MapProvider, _theme: string): void { /* no-op */ }
export const hasPMTilesUrl = false;
export const MAP_PROVIDER_OPTIONS: { value: MapProvider; label: string }[] = [
  { value: 'carto', label: 'CARTO' },
];
export const MAP_THEME_OPTIONS: Record<string, { value: string; label: string }[]> = {
  carto: [{ value: 'dark-matter', label: 'Dark Matter' }],
};
