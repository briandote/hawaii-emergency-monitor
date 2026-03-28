import { Panel } from './Panel';
import { escapeHtml } from '@/utils/sanitize';
import { toApiUrl } from '@/services/runtime';
import type { Alert, ListActiveAlertsResponse } from '@/generated/server/worldmonitor/emergency/v1/service_server';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function severityRank(severity: string): number {
  const s = severity.toLowerCase();
  if (s.includes('warning') || s.includes('extreme') || s.includes('severe')) return 0;
  if (s.includes('watch')) return 1;
  if (s.includes('advisory') || s.includes('statement')) return 2;
  return 3;
}

function severityColor(severity: string): string {
  const rank = severityRank(severity);
  if (rank === 0) return '#ff2020';
  if (rank === 1) return '#ff8800';
  return '#ffcc00';
}

function severityBg(severity: string): string {
  const rank = severityRank(severity);
  if (rank === 0) return 'rgba(255,32,32,0.12)';
  if (rank === 1) return 'rgba(255,136,0,0.12)';
  return 'rgba(255,204,0,0.08)';
}

function severityLabel(severity: string): string {
  const rank = severityRank(severity);
  if (rank === 0) return 'WARNING';
  if (rank === 1) return 'WATCH';
  return 'ADVISORY';
}

function formatAlertTime(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  } catch {
    return iso;
  }
}

export class ActiveAlertsPanel extends Panel {
  private alerts: Alert[] = [];
  private hasData = false;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private expandedIds: Set<string> = new Set();

  constructor() {
    super({
      id: 'active-alerts',
      title: 'Active Alerts',
      showCount: true,
      trackActivity: true,
      defaultRowSpan: 2,
    });
    this.content.addEventListener('click', (e) => {
      const row = (e.target as HTMLElement).closest<HTMLElement>('[data-alert-id]');
      if (!row) return;
      const alertId = row.dataset.alertId ?? '';
      if (this.expandedIds.has(alertId)) {
        this.expandedIds.delete(alertId);
      } else {
        this.expandedIds.add(alertId);
      }
      this.render();
    });
  }

  public async fetchData(): Promise<boolean> {
    this.showLoading();
    try {
      const resp = await fetch(toApiUrl('/api/emergency/v1/list-active-alerts'));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: ListActiveAlertsResponse = await resp.json();
      if (!data.alerts?.length) {
        this.alerts = [];
        this.hasData = true;
        this.setCount(0);
        this.render();
        return true;
      }
      this.alerts = [...data.alerts].sort((a, b) => {
        const rankDiff = severityRank(a.event) - severityRank(b.event);
        if (rankDiff !== 0) return rankDiff;
        return new Date(a.onset || '').getTime() - new Date(b.onset || '').getTime();
      });
      this.hasData = true;
      this.setCount(this.alerts.length);
      this.resetRetryBackoff();
      this.render();
      return true;
    } catch (e) {
      if (!this.hasData) {
        this.showError(
          e instanceof Error ? e.message : 'Failed to load alerts',
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
    if (this.alerts.length === 0) {
      this.setContent(`
        <div class="panel-empty" style="text-align:center;padding:24px 16px">
          <div style="font-size:28px;margin-bottom:8px">\u2705</div>
          <div style="color:var(--text-secondary)">No active alerts for Hawaii</div>
        </div>
      `);
      return;
    }

    const rows = this.alerts.map(alert => {
      const color = severityColor(alert.event);
      const bg = severityBg(alert.event);
      const label = severityLabel(alert.event);
      const expanded = this.expandedIds.has(alert.id);

      const expandedHtml = expanded ? `
        <div style="margin-top:8px;padding:8px 0;border-top:1px solid var(--border);font-size:11px;line-height:1.5;color:var(--text-secondary)">
          ${alert.description ? `<div style="margin-bottom:6px">${escapeHtml(alert.description)}</div>` : ''}
          ${alert.instruction ? `<div style="padding:6px 8px;background:rgba(255,255,255,0.04);border-radius:4px;border-left:2px solid ${color}"><strong>Instructions:</strong> ${escapeHtml(alert.instruction)}</div>` : ''}
        </div>
      ` : '';

      return `<div data-alert-id="${escapeHtml(alert.id)}" style="padding:10px 12px;border-bottom:1px solid var(--border);background:${bg};cursor:pointer;transition:background 0.15s">
        <div style="display:flex;align-items:flex-start;gap:8px">
          <span style="flex-shrink:0;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:${color}22;color:${color};margin-top:1px">${label}</span>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:12px;color:var(--text-primary)">${escapeHtml(alert.event)}</div>
            ${alert.headline ? `<div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${escapeHtml(alert.headline)}</div>` : ''}
            <div style="display:flex;gap:8px;margin-top:4px;font-size:10px;color:var(--text-dim)">
              ${alert.areaDesc ? `<span>\u{1F4CD} ${escapeHtml(alert.areaDesc)}</span>` : ''}
            </div>
            <div style="display:flex;gap:12px;margin-top:4px;font-size:10px;color:var(--text-dim)">
              ${alert.onset ? `<span>Onset: ${escapeHtml(formatAlertTime(alert.onset))}</span>` : ''}
              ${alert.expires ? `<span>Expires: ${escapeHtml(formatAlertTime(alert.expires))}</span>` : ''}
              ${alert.urgency ? `<span>Urgency: ${escapeHtml(alert.urgency)}</span>` : ''}
            </div>
          </div>
          <span style="font-size:10px;color:var(--text-dim)">${expanded ? '\u25B2' : '\u25BC'}</span>
        </div>
        ${expandedHtml}
      </div>`;
    }).join('');

    this.setContent(`<div class="alerts-panel-content">${rows}</div>`);
  }

  public destroy(): void {
    this.stopAutoRefresh();
    super.destroy();
  }
}
