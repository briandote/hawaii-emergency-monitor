import { Panel } from './Panel';
import { escapeHtml } from '@/utils/sanitize';
import { toApiUrl } from '@/services/runtime';
import type { RoadClosure, ListRoadClosuresResponse } from '@/generated/server/worldmonitor/emergency/v1/service_server';

const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const ISLANDS = ['All Islands', 'Oahu', 'Maui', 'Hawaii', 'Kauai', 'Molokai', 'Lanai'] as const;

function closureStatusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'closed') return '#ff2020';
  if (s === 'restricted') return '#f1c40f';
  if (s === 'reopened') return '#2ecc71';
  return '#95a5a6';
}

function closureStatusBg(status: string): string {
  const s = status.toLowerCase();
  if (s === 'closed') return 'rgba(255,32,32,0.12)';
  if (s === 'restricted') return 'rgba(241,196,15,0.10)';
  if (s === 'reopened') return 'rgba(46,204,113,0.10)';
  return 'rgba(149,165,166,0.08)';
}

function closureStatusRank(status: string): number {
  const s = status.toLowerCase();
  if (s === 'closed') return 0;
  if (s === 'restricted') return 1;
  if (s === 'reopened') return 2;
  return 3;
}

function formatUpdatedTime(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return iso;
  }
}

export class RoadClosurePanel extends Panel {
  private closures: RoadClosure[] = [];
  private hasData = false;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private islandFilter = 'All Islands';

  constructor() {
    super({
      id: 'road-closures',
      title: 'Road Closures',
      showCount: true,
      trackActivity: true,
      defaultRowSpan: 2,
    });
    this.content.addEventListener('change', (e) => {
      const sel = e.target as HTMLSelectElement;
      if (sel.dataset.role === 'island-filter') {
        this.islandFilter = sel.value;
        this.render();
      }
    });
  }

  public async fetchData(): Promise<boolean> {
    this.showLoading();
    try {
      const resp = await fetch(toApiUrl('/api/emergency/v1/list-road-closures'));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: ListRoadClosuresResponse = await resp.json();
      this.closures = [...(data.closures ?? [])].sort((a, b) => {
        const rankDiff = closureStatusRank(a.status) - closureStatusRank(b.status);
        if (rankDiff !== 0) return rankDiff;
        return (new Date(b.updatedAt || '').getTime() || 0) - (new Date(a.updatedAt || '').getTime() || 0);
      });
      this.hasData = true;
      this.setCount(this.closures.length);
      this.resetRetryBackoff();
      this.render();
      return true;
    } catch (e) {
      if (!this.hasData) {
        this.showError(
          e instanceof Error ? e.message : 'Failed to load road closures',
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

  private getFiltered(): RoadClosure[] {
    if (this.islandFilter === 'All Islands') return this.closures;
    return this.closures.filter(c => c.island === this.islandFilter);
  }

  private render(): void {
    if (!this.hasData) return;

    const filtered = this.getFiltered();

    const filterBar = `<div style="display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);flex-wrap:wrap;align-items:center">
      <select data-role="island-filter" style="font-size:11px;padding:3px 6px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px">
        ${ISLANDS.map(i => `<option value="${escapeHtml(i)}" ${i === this.islandFilter ? 'selected' : ''}>${escapeHtml(i)}</option>`).join('')}
      </select>
      <span style="font-size:10px;color:var(--text-dim)">${filtered.length} closure${filtered.length !== 1 ? 's' : ''}</span>
    </div>`;

    if (filtered.length === 0 && this.closures.length === 0) {
      this.setContent(`
        ${filterBar}
        <div class="panel-empty" style="text-align:center;padding:24px 16px">
          <div style="font-size:28px;margin-bottom:8px">\u2705</div>
          <div style="color:var(--text-secondary)">No road closures reported</div>
        </div>
      `);
      return;
    }

    if (filtered.length === 0) {
      this.setContent(`
        ${filterBar}
        <div class="panel-empty" style="text-align:center;padding:24px 16px">
          <div style="color:var(--text-secondary)">No closures match current filter</div>
        </div>
      `);
      return;
    }

    const rows = filtered.map(c => {
      const color = closureStatusColor(c.status);
      const bg = closureStatusBg(c.status);
      const timeStr = formatUpdatedTime(c.updatedAt);

      return `<div style="padding:10px 12px;border-bottom:1px solid var(--border);background:${bg}">
        <div style="display:flex;align-items:flex-start;gap:8px">
          <span style="flex-shrink:0;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:${color}22;color:${color}">${escapeHtml(c.status.toUpperCase())}</span>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:12px;color:var(--text-primary)">${escapeHtml(c.road)}</div>
            ${c.location ? `<div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${escapeHtml(c.location)}</div>` : ''}
            <div style="display:flex;gap:8px;margin-top:4px;font-size:10px;color:var(--text-dim);flex-wrap:wrap">
              ${c.island ? `<span>${escapeHtml(c.island)}</span>` : ''}
              ${c.reason ? `<span>\u00B7 ${escapeHtml(c.reason)}</span>` : ''}
              ${timeStr ? `<span>\u00B7 Updated ${escapeHtml(timeStr)}</span>` : ''}
            </div>
            ${c.detour ? `<div style="margin-top:6px;padding:4px 8px;background:rgba(255,255,255,0.04);border-radius:4px;border-left:2px solid var(--accent-primary);font-size:10px;color:var(--text-secondary)"><strong>Detour:</strong> ${escapeHtml(c.detour)}</div>` : ''}
          </div>
        </div>
      </div>`;
    }).join('');

    this.setContent(`${filterBar}<div class="closures-panel-content">${rows}</div>`);
  }

  public destroy(): void {
    this.stopAutoRefresh();
    super.destroy();
  }
}
