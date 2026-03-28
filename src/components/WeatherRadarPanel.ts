import { Panel } from './Panel';
import { escapeHtml } from '@/utils/sanitize';

const RAINVIEWER_API = 'https://api.rainviewer.com/public/weather-maps.json';

/** Radar color legend entries (RainViewer color scheme 6). */
const RADAR_LEGEND: Array<{ color: string; label: string }> = [
  { color: '#20a020', label: 'Light' },
  { color: '#40c040', label: 'Moderate' },
  { color: '#f0f000', label: 'Heavy' },
  { color: '#f08000', label: 'Very Heavy' },
  { color: '#f00000', label: 'Extreme' },
  { color: '#c000c0', label: 'Intense' },
];

interface RadarFrame {
  path: string;
  time: number; // Unix timestamp
}

interface RainViewerResponse {
  host: string;
  radar: {
    past: RadarFrame[];
    nowcast: RadarFrame[];
  };
}

const HAWAII_CENTER = { lat: 21.31, lon: -157.86 };
const RADAR_ZOOM = 7;
const TILE_SIZE = 256;
const FRAME_INTERVAL_MS = 800;
const RADAR_REFRESH_MS = 5 * 60 * 1000; // Refresh radar data every 5 minutes

/**
 * WeatherRadarPanel -- displays NOAA/RainViewer weather radar imagery
 * centered on Hawaii with play/pause animation controls and a color legend.
 * Panel ID: 'weather-radar'
 */
export class WeatherRadarPanel extends Panel {
  private host = '';
  private frames: RadarFrame[] = [];
  private currentFrameIdx = 0;
  private isPlaying = false;
  private animationTimer: ReturnType<typeof setInterval> | null = null;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private imgEl: HTMLImageElement | null = null;
  private timestampEl: HTMLElement | null = null;
  private playBtn: HTMLButtonElement | null = null;
  private frameCounterEl: HTMLElement | null = null;

  constructor() {
    super({
      id: 'weather-radar',
      title: 'Weather Radar',
      showCount: false,
      trackActivity: true,
      infoTooltip: 'Live weather radar for Hawaii via RainViewer. Shows precipitation intensity with animation controls for recent frames.',
    });
    this.showLoading('Loading radar data...');
  }

  /** Fetch radar data and start rendering. Called externally after panel creation. */
  public async fetchData(): Promise<boolean> {
    this.showLoading('Loading radar data...');
    try {
      const resp = await fetch(RAINVIEWER_API, { signal: this.signal });
      const data: RainViewerResponse = await resp.json();
      this.host = data.host;
      this.frames = [...(data.radar?.past ?? []), ...(data.radar?.nowcast ?? [])];

      if (this.frames.length === 0) {
        this.showError('No radar frames available', () => void this.fetchData());
        return false;
      }

      this.currentFrameIdx = this.frames.length - 1;
      this.renderRadarUI();
      this.startRefreshTimer();
      return true;
    } catch (e) {
      if (this.isAbortError(e)) return false;
      this.showError(e instanceof Error ? e.message : 'Failed to load radar', () => void this.fetchData());
      return false;
    }
  }

  private startRefreshTimer(): void {
    this.stopRefreshTimer();
    this.refreshTimer = setInterval(() => {
      void this.refreshFrames();
    }, RADAR_REFRESH_MS);
  }

  private stopRefreshTimer(): void {
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /** Silently refresh frames without disrupting current view. */
  private async refreshFrames(): Promise<void> {
    try {
      const resp = await fetch(RAINVIEWER_API, { signal: this.signal });
      const data: RainViewerResponse = await resp.json();
      this.host = data.host;
      this.frames = [...(data.radar?.past ?? []), ...(data.radar?.nowcast ?? [])];
      if (this.frames.length > 0 && !this.isPlaying) {
        this.currentFrameIdx = this.frames.length - 1;
        this.updateFrameDisplay();
      }
    } catch {
      // Silent failure on refresh -- keep showing existing data
    }
  }

  private renderRadarUI(): void {
    const frame = this.frames[this.currentFrameIdx];
    if (!frame) return;

    const tileUrl = this.buildTileUrl(frame);
    const timeStr = this.formatTimestamp(frame.time);

    const html = `
      <div class="weather-radar-container" style="display:flex;flex-direction:column;height:100%">
        <div class="weather-radar-image" style="flex:1;min-height:180px;position:relative;background:#1a1a2e;border-radius:4px;overflow:hidden">
          <img id="weather-radar-img" src="${escapeHtml(tileUrl)}" alt="Hawaii weather radar"
               style="width:100%;height:100%;object-fit:contain"
               onerror="this.style.display='none'">
          <div style="position:absolute;bottom:4px;right:4px;font-size:9px;color:rgba(255,255,255,0.6);background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:3px">
            &copy; RainViewer
          </div>
        </div>

        <div class="weather-radar-controls" style="display:flex;align-items:center;gap:8px;padding:8px 0">
          <button id="weather-radar-play" style="font-size:12px;padding:4px 12px;border-radius:4px;border:1px solid var(--border);background:var(--bg-secondary);color:var(--text-primary);cursor:pointer" aria-label="Play radar animation">
            &#9654; Play
          </button>
          <span id="weather-radar-frame-counter" style="font-size:10px;color:var(--text-dim)">
            ${this.currentFrameIdx + 1} / ${this.frames.length}
          </span>
          <span style="flex:1"></span>
          <span id="weather-radar-timestamp" style="font-size:11px;color:var(--text-secondary)">
            ${escapeHtml(timeStr)}
          </span>
        </div>

        <div class="weather-radar-legend" style="display:flex;gap:6px;flex-wrap:wrap;padding:4px 0;border-top:1px solid var(--border)">
          ${RADAR_LEGEND.map(e => `<span style="display:flex;align-items:center;gap:3px;font-size:9px;color:var(--text-dim)"><span style="width:10px;height:10px;border-radius:2px;background:${e.color}"></span>${escapeHtml(e.label)}</span>`).join('')}
        </div>
      </div>
    `;

    this.setContent(html);

    this.imgEl = this.content.querySelector<HTMLImageElement>('#weather-radar-img');
    this.timestampEl = this.content.querySelector<HTMLElement>('#weather-radar-timestamp');
    this.playBtn = this.content.querySelector<HTMLButtonElement>('#weather-radar-play');
    this.frameCounterEl = this.content.querySelector<HTMLElement>('#weather-radar-frame-counter');

    this.playBtn?.addEventListener('click', () => this.togglePlayback());
  }

  private togglePlayback(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private play(): void {
    this.isPlaying = true;
    if (this.playBtn) this.playBtn.innerHTML = '&#9646;&#9646; Pause';
    this.animationTimer = setInterval(() => {
      this.currentFrameIdx = (this.currentFrameIdx + 1) % this.frames.length;
      this.updateFrameDisplay();
    }, FRAME_INTERVAL_MS);
  }

  private pause(): void {
    this.isPlaying = false;
    if (this.playBtn) this.playBtn.innerHTML = '&#9654; Play';
    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
  }

  private updateFrameDisplay(): void {
    const frame = this.frames[this.currentFrameIdx];
    if (!frame) return;

    if (this.imgEl) {
      this.imgEl.src = this.buildTileUrl(frame);
      this.imgEl.style.display = '';
    }
    if (this.timestampEl) {
      this.timestampEl.textContent = this.formatTimestamp(frame.time);
    }
    if (this.frameCounterEl) {
      this.frameCounterEl.textContent = `${this.currentFrameIdx + 1} / ${this.frames.length}`;
    }
  }

  /**
   * Build a single radar tile URL centered on Hawaii.
   * Uses RainViewer's tile endpoint at a fixed zoom/x/y covering the islands.
   */
  private buildTileUrl(frame: RadarFrame): string {
    // Convert lat/lon to tile coordinates at the given zoom
    const n = Math.pow(2, RADAR_ZOOM);
    const x = Math.floor(((HAWAII_CENTER.lon + 180) / 360) * n);
    const latRad = (HAWAII_CENTER.lat * Math.PI) / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return `${this.host}${frame.path}/${TILE_SIZE}/${RADAR_ZOOM}/${x}/${y}/6/1_1.png`;
  }

  private formatTimestamp(unix: number): string {
    const d = new Date(unix * 1000);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      + ' ' + d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  public destroy(): void {
    this.pause();
    this.stopRefreshTimer();
    this.imgEl = null;
    this.timestampEl = null;
    this.playBtn = null;
    this.frameCounterEl = null;
    super.destroy();
  }
}
