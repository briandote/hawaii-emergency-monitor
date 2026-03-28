import { Panel } from './Panel';
import { escapeHtml } from '@/utils/sanitize';
import { toApiUrl } from '@/services/runtime';
import type { PowerOutage, ListPowerOutagesResponse } from '@/generated/server/worldmonitor/emergency/v1/service_server';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function severityColor(customers: number): string {
  if (customers > 1000) return '#ff2020';
  if (customers > 100) return '#ff8800';
  return '#f1c40f';
}

function severityBg(customers: number): string {
  if (customers > 1000) return 'rgba(255,32,32,0.12)';
  if (customers > 100) return 'rgba(255,136,0,0.10)';
  return 'rgba(241,196,15,0.08)';
}

function severityLabel(customers: number): string {
  if (customers > 1000) return 'MAJOR';
  if (customers > 100) return 'MODERATE';
  return 'MINOR';
}

function formatRestoration(iso: string): string {
  if (!iso) return 'TBD';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatStartTime(iso: string): string {
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

export class PowerOutagePanel extends Panel {
  private outages: PowerOutage[] = [];
  private hasData = false;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super({
      id: 'power-outages',
      title: 'Power Outages',
      showCount: true,
      trackActivity: true,
      defaultRowSpan: 2,
    });
  }

  public async fetchData(): Promise<boolean> {
    this.showLoading();
    try {
      const resp = await fetch(toApiUrl('/api/emergency/v1/list-power-outages'));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: ListPowerOutagesResponse = await resp.json();
      this.outages = [...(data.outages ?? [])].sort(
        (a, b) => b.customersAffected - a.customersAffected,
      );
      this.hasData = true;
      this.setCount(this.outages.length);
      this.resetRetryBackoff();
      this.render();
      return true;
    } catch (e) {
      if (!this.hasData) {
        this.showError(
          e instanceof Error ? e.message : 'Failed to load outage data',
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
    if (this.outages.length === 0) {
      this.setContent(`
        <div class="panel-empty" style="text-align:center;padding:24px 16px">
          <div style="font-size:28px;margin-bottom:8px">\u2705</div>
          <div style="color:var(--text-secondary)">No power outages reported</div>
        </div>
      `);
      return;
    }

    const totalOutages = this.outages.length;
    const totalCustomers = this.outages.reduce((sum, o) => sum + o.customersAffected, 0);

    const summaryBar = `<div style="display:flex;gap:16px;padding:10px 12px;border-bottom:1px solid var(--border);background:var(--bg-secondary)">
      <div style="text-align:center;flex:1">
        <div style="font-size:20px;font-weight:700;color:var(--text-primary)">${totalOutages}</div>
        <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase">Active Outages</div>
      </div>
      <div style="text-align:center;flex:1">
        <div style="font-size:20px;font-weight:700;color:${totalCustomers > 5000 ? '#ff2020' : totalCustomers > 1000 ? '#ff8800' : 'var(--text-primary)'}">${totalCustomers.toLocaleString()}</div>
        <div style="font-size:9px;color:var(--text-dim);text-transform:uppercase">Customers Affected</div>
      </div>
    </div>`;

    const rows = this.outages.map(o => {
      const color = severityColor(o.customersAffected);
      const bg = severityBg(o.customersAffected);
      const label = severityLabel(o.customersAffected);
      const startStr = formatStartTime(o.startTime);
      const restoreStr = formatRestoration(o.estimatedRestoration);

      return `<div style="padding:10px 12px;border-bottom:1px solid var(--border);background:${bg}">
        <div style="display:flex;align-items:flex-start;gap:8px">
          <span style="flex-shrink:0;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:${color}22;color:${color}">${label}</span>
          <div style="flex:1;min-width:0">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <div style="font-weight:600;font-size:12px;color:var(--text-primary)">${escapeHtml(o.area)}</div>
              <div style="font-size:12px;font-weight:700;color:${color}">${o.customersAffected.toLocaleString()}</div>
            </div>
            <div style="display:flex;gap:8px;margin-top:4px;font-size:10px;color:var(--text-dim);flex-wrap:wrap">
              ${o.island ? `<span>${escapeHtml(o.island)}</span>` : ''}
              ${o.cause ? `<span>\u00B7 ${escapeHtml(o.cause)}</span>` : ''}
              ${startStr ? `<span>\u00B7 Started ${escapeHtml(startStr)}</span>` : ''}
            </div>
            <div style="margin-top:4px;font-size:10px;color:var(--text-secondary)">
              Est. Restoration: <strong>${escapeHtml(restoreStr)}</strong>
            </div>
          </div>
        </div>
      </div>`;
    }).join('');

    this.setContent(`${summaryBar}<div class="outages-panel-content">${rows}</div>`);
  }

  public destroy(): void {
    this.stopAutoRefresh();
    super.destroy();
  }
}
