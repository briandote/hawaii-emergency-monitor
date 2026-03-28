import { Panel } from './Panel';
import { escapeHtml } from '@/utils/sanitize';
import { toApiUrl } from '@/services/runtime';
import type { StreamGauge, ListStreamGaugesResponse } from '@/generated/server/worldmonitor/emergency/v1/service_server';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

type GaugeStatus = 'normal' | 'action' | 'flood' | 'major';

function getGaugeStatus(gauge: StreamGauge): GaugeStatus {
  if (gauge.floodStage <= 0) return 'normal';
  const ratio = gauge.gaugeHeight / gauge.floodStage;
  if (ratio >= 1.5) return 'major';
  if (ratio >= 1.0) return 'flood';
  if (ratio >= 0.75) return 'action';
  return 'normal';
}

function statusRank(status: GaugeStatus): number {
  if (status === 'major') return 0;
  if (status === 'flood') return 1;
  if (status === 'action') return 2;
  return 3;
}

function statusColor(status: GaugeStatus): string {
  if (status === 'major') return '#ff2020';
  if (status === 'flood') return '#ff8800';
  if (status === 'action') return '#f1c40f';
  return '#2ecc71';
}

function statusLabel(status: GaugeStatus): string {
  if (status === 'major') return 'MAJOR FLOOD';
  if (status === 'flood') return 'FLOOD STAGE';
  if (status === 'action') return 'ACTION';
  return 'NORMAL';
}

function statusBg(status: GaugeStatus): string {
  if (status === 'major') return 'rgba(255,32,32,0.12)';
  if (status === 'flood') return 'rgba(255,136,0,0.12)';
  if (status === 'action') return 'rgba(241,196,15,0.08)';
  return 'transparent';
}

function formatReadingTime(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function islandFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('oahu')) return 'Oahu';
  if (lower.includes('maui')) return 'Maui';
  if (lower.includes('kauai')) return 'Kauai';
  if (lower.includes('hawaii') || lower.includes('big island') || lower.includes('hilo') || lower.includes('kona')) return 'Hawaii';
  if (lower.includes('molokai')) return 'Molokai';
  if (lower.includes('lanai')) return 'Lanai';
  return '';
}

export class StreamGaugePanel extends Panel {
  private gauges: StreamGauge[] = [];
  private hasData = false;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super({
      id: 'stream-gauges',
      title: 'Stream Gauges',
      showCount: true,
      trackActivity: true,
      defaultRowSpan: 2,
    });
  }

  public async fetchData(): Promise<boolean> {
    this.showLoading();
    try {
      const resp = await fetch(toApiUrl('/api/emergency/v1/list-stream-gauges'));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: ListStreamGaugesResponse = await resp.json();
      if (!data.gauges?.length) {
        this.gauges = [];
        this.hasData = true;
        this.setCount(0);
        this.render();
        return true;
      }
      this.gauges = [...data.gauges].sort((a, b) => {
        const statusA = getGaugeStatus(a);
        const statusB = getGaugeStatus(b);
        const rankDiff = statusRank(statusA) - statusRank(statusB);
        if (rankDiff !== 0) return rankDiff;
        return b.gaugeHeight - a.gaugeHeight;
      });
      this.hasData = true;
      this.setCount(this.gauges.length);
      this.resetRetryBackoff();
      this.render();
      return true;
    } catch (e) {
      if (!this.hasData) {
        this.showError(
          e instanceof Error ? e.message : 'Failed to load stream gauges',
          () => void this.fetchData(),
        );
      }
      return false;
    }
  }

  public startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => void this.fetchData(), REFRESH_INTERVAL_MS);
  }

  public stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private render(): void {
    if (this.gauges.length === 0) {
      this.setContent(`
        <div class="panel-empty" style="text-align:center;padding:24px 16px">
          <div style="font-size:28px;margin-bottom:8px">\u2705</div>
          <div style="color:var(--text-secondary)">No stream gauge data available</div>
        </div>
      `);
      return;
    }

    const headerRow = `<div style="display:grid;grid-template-columns:1fr 70px 80px 60px 80px;gap:4px;padding:6px 12px;font-size:9px;font-weight:700;color:var(--text-dim);text-transform:uppercase;border-bottom:1px solid var(--border)">
      <span>Site</span>
      <span style="text-align:right">Height (ft)</span>
      <span style="text-align:right">Flow (cfs)</span>
      <span style="text-align:right">Flood Stg</span>
      <span style="text-align:center">Status</span>
    </div>`;

    const rows = this.gauges.map(g => {
      const status = getGaugeStatus(g);
      const color = statusColor(status);
      const label = statusLabel(status);
      const bg = statusBg(status);
      const island = islandFromName(g.siteName);
      const heightStr = g.gaugeHeight > 0 ? g.gaugeHeight.toFixed(2) : '\u2014';
      const dischargeStr = g.discharge > 0 ? g.discharge.toLocaleString() : '\u2014';
      const floodStr = g.floodStage > 0 ? g.floodStage.toFixed(1) : 'N/A';
      const timeStr = formatReadingTime(g.dateTime);

      return `<div style="display:grid;grid-template-columns:1fr 70px 80px 60px 80px;gap:4px;padding:8px 12px;border-bottom:1px solid var(--border);background:${bg};align-items:center">
        <div>
          <div style="font-size:11px;font-weight:600;color:var(--text-primary)">${escapeHtml(g.siteName)}</div>
          <div style="font-size:9px;color:var(--text-dim)">${island ? escapeHtml(island) + ' \u00B7 ' : ''}${escapeHtml(timeStr)}</div>
        </div>
        <span style="text-align:right;font-size:12px;font-weight:600;color:${status !== 'normal' ? color : 'var(--text-primary)'}">${heightStr}</span>
        <span style="text-align:right;font-size:11px;color:var(--text-secondary)">${dischargeStr}</span>
        <span style="text-align:right;font-size:11px;color:var(--text-dim)">${floodStr}</span>
        <span style="text-align:center;font-size:8px;font-weight:700;padding:2px 4px;border-radius:3px;background:${color}22;color:${color}">${label}</span>
      </div>`;
    }).join('');

    this.setContent(`<div class="gauges-panel-content">${headerRow}${rows}</div>`);
  }

  public destroy(): void {
    this.stopAutoRefresh();
    super.destroy();
  }
}
