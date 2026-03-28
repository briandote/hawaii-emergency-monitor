import { Panel } from './Panel';
import { escapeHtml } from '@/utils/sanitize';
import { toApiUrl } from '@/services/runtime';
import type { Shelter, ListSheltersResponse } from '@/generated/server/worldmonitor/emergency/v1/service_server';

const REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

const ISLANDS = ['All Islands', 'Oahu', 'Maui', 'Hawaii', 'Kauai', 'Molokai', 'Lanai'] as const;
const STATUS_OPTIONS = ['All', 'Open', 'Limited', 'Full', 'Standby', 'Closed'] as const;

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s === 'open') return '#2ecc71';
  if (s === 'limited') return '#f1c40f';
  if (s === 'full') return '#e74c3c';
  if (s === 'standby') return '#95a5a6';
  return '#555';
}

function statusBg(status: string): string {
  const s = status.toLowerCase();
  if (s === 'open') return 'rgba(46,204,113,0.15)';
  if (s === 'limited') return 'rgba(241,196,15,0.15)';
  if (s === 'full') return 'rgba(231,76,60,0.15)';
  if (s === 'standby') return 'rgba(149,165,166,0.12)';
  return 'rgba(85,85,85,0.12)';
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export class ShelterMapPanel extends Panel {
  private shelters: Shelter[] = [];
  private hasData = false;
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private islandFilter = 'All Islands';
  private statusFilter = 'All';

  constructor() {
    super({
      id: 'shelter-map',
      title: 'Shelters',
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
      if (sel.dataset.role === 'status-filter') {
        this.statusFilter = sel.value;
        this.render();
      }
    });
  }

  public async fetchData(): Promise<boolean> {
    this.showLoading();
    try {
      const resp = await fetch(toApiUrl('/api/emergency/v1/list-shelters'));
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data: ListSheltersResponse = await resp.json();
      this.shelters = data.shelters ?? [];
      this.hasData = true;
      this.setCount(this.shelters.length);
      this.resetRetryBackoff();
      this.render();
      return true;
    } catch (e) {
      if (!this.hasData) {
        this.showError(
          e instanceof Error ? e.message : 'Failed to load shelters',
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

  private getFiltered(): Shelter[] {
    return this.shelters.filter(s => {
      if (this.islandFilter !== 'All Islands' && s.island !== this.islandFilter) return false;
      if (this.statusFilter !== 'All' && s.status.toLowerCase() !== this.statusFilter.toLowerCase()) return false;
      return true;
    });
  }

  private render(): void {
    if (!this.hasData) return;

    const filtered = this.getFiltered();

    const filterBar = `<div style="display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);flex-wrap:wrap">
      <select data-role="island-filter" style="font-size:11px;padding:3px 6px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px">
        ${ISLANDS.map(i => `<option value="${escapeHtml(i)}" ${i === this.islandFilter ? 'selected' : ''}>${escapeHtml(i)}</option>`).join('')}
      </select>
      <select data-role="status-filter" style="font-size:11px;padding:3px 6px;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border);border-radius:4px">
        ${STATUS_OPTIONS.map(s => `<option value="${escapeHtml(s)}" ${s === this.statusFilter ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
      </select>
      <span style="font-size:10px;color:var(--text-dim);align-self:center">${filtered.length} shelter${filtered.length !== 1 ? 's' : ''}</span>
    </div>`;

    if (filtered.length === 0 && this.shelters.length === 0) {
      this.setContent(`
        ${filterBar}
        <div class="panel-empty" style="text-align:center;padding:24px 16px">
          <div style="color:var(--text-secondary)">No shelter data available</div>
        </div>
      `);
      return;
    }

    if (filtered.length === 0) {
      this.setContent(`
        ${filterBar}
        <div class="panel-empty" style="text-align:center;padding:24px 16px">
          <div style="color:var(--text-secondary)">No shelters match current filters</div>
        </div>
      `);
      return;
    }

    const rows = filtered.map(s => {
      const color = statusColor(s.status);
      const bg = statusBg(s.status);
      const ada = s.adaAccessible ? '\u267F' : '';
      const pets = s.petsAllowed ? '\u{1F43E}' : '';
      return `<div style="padding:10px 12px;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:flex-start;gap:8px">
          <span style="flex-shrink:0;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:${bg};color:${color}">${escapeHtml(s.status)}</span>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:12px;color:var(--text-primary)">${escapeHtml(s.name)}</div>
            <div style="font-size:10px;color:var(--text-dim);margin-top:2px">${escapeHtml(s.island)}${s.type ? ` \u00B7 ${escapeHtml(s.type)}` : ''}</div>
            ${s.address ? `<div style="margin-top:4px"><a href="${escapeHtml(mapsUrl(s.address))}" target="_blank" rel="noopener noreferrer" style="font-size:10px;color:var(--accent-primary);text-decoration:none">\u{1F4CD} ${escapeHtml(s.address)}</a></div>` : ''}
            <div style="display:flex;gap:10px;margin-top:4px;font-size:10px;color:var(--text-dim)">
              <span>Capacity: ${s.capacity > 0 ? s.capacity.toLocaleString() : 'N/A'}</span>
              ${ada ? `<span>${ada} ADA</span>` : ''}
              ${pets ? `<span>${pets} Pets</span>` : ''}
            </div>
          </div>
        </div>
      </div>`;
    }).join('');

    this.setContent(`${filterBar}<div class="shelters-panel-content">${rows}</div>`);
  }

  public destroy(): void {
    this.stopAutoRefresh();
    super.destroy();
  }
}
