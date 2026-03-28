import { Panel } from './Panel';
import type { NewsItem } from '@/types';
import { formatTime } from '@/utils';
import { escapeHtml, sanitizeUrl } from '@/utils/sanitize';

type IslandFilter = 'all' | 'oahu' | 'maui' | 'big-island' | 'kauai' | 'molokai' | 'lanai';

const ISLAND_LABELS: Record<IslandFilter, string> = {
  'all': 'All',
  'oahu': 'Oahu',
  'maui': 'Maui',
  'big-island': 'Big Island',
  'kauai': 'Kauai',
  'molokai': 'Molokai',
  'lanai': 'Lanai',
};

/** Keywords used to match an article to an island. */
const ISLAND_KEYWORDS: Record<Exclude<IslandFilter, 'all'>, string[]> = {
  'oahu': ['oahu', 'honolulu', 'waikiki', 'pearl city', 'kaneohe', 'kailua', 'ewa', 'waipahu', 'aiea', 'north shore'],
  'maui': ['maui', 'lahaina', 'kihei', 'kahului', 'wailuku', 'hana'],
  'big-island': ['big island', 'hawaii island', 'hilo', 'kona', 'kailua-kona', 'kilauea', 'volcano', 'waimea', 'hawaii county'],
  'kauai': ['kauai', 'lihue', 'kapaa', 'poipu', 'princeville'],
  'molokai': ['molokai', 'kaunakakai'],
  'lanai': ['lanai', 'lanai city'],
};

const DISCLAIMER = 'Community reports are unverified. Follow official sources for evacuation and safety guidance.';
const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * CommunityReportsPanel -- curated feed of community-sourced information
 * about Hawaii emergencies, aggregated from news RSS and social feeds.
 * Panel ID: 'community-reports'
 */
export class CommunityReportsPanel extends Panel {
  private allItems: NewsItem[] = [];
  private activeFilter: IslandFilter = 'all';
  private filterBar: HTMLElement | null = null;
  private filterClickHandlers: Map<HTMLButtonElement, () => void> = new Map();
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super({
      id: 'community-reports',
      title: 'Community Reports',
      showCount: true,
      trackActivity: true,
      infoTooltip: 'Community-sourced reports about Hawaii emergencies aggregated from local news and social media. Reports are unverified -- always follow official sources.',
    });
    this.createFilterBar();
    this.showLoading('Loading community reports...');
  }

  /** Create the island filter bar between header and content. */
  private createFilterBar(): void {
    this.filterBar = document.createElement('div');
    this.filterBar.className = 'community-reports-filters';
    this.filterBar.style.cssText = 'display:flex;gap:4px;padding:6px 10px;flex-wrap:wrap;border-bottom:1px solid var(--border)';

    for (const [key, label] of Object.entries(ISLAND_LABELS) as Array<[IslandFilter, string]>) {
      const btn = document.createElement('button');
      btn.className = `community-filter-btn${key === 'all' ? ' active' : ''}`;
      btn.textContent = label;
      btn.dataset.filter = key;
      btn.style.cssText = `font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid var(--border);background:${key === 'all' ? 'var(--accent-primary)' : 'transparent'};color:${key === 'all' ? '#fff' : 'var(--text-secondary)'};cursor:pointer`;

      const handler = () => this.setFilter(key);
      btn.addEventListener('click', handler);
      this.filterClickHandlers.set(btn, handler);
      this.filterBar.appendChild(btn);
    }

    this.element.insertBefore(this.filterBar, this.content);
  }

  private setFilter(filter: IslandFilter): void {
    this.activeFilter = filter;
    if (this.filterBar) {
      for (const btn of this.filterBar.querySelectorAll<HTMLButtonElement>('.community-filter-btn')) {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.style.background = isActive ? 'var(--accent-primary)' : 'transparent';
        btn.style.color = isActive ? '#fff' : 'var(--text-secondary)';
      }
    }
    this.render();
  }

  /**
   * Receive community report items from RSS / social feeds.
   * Called externally when the emergency variant's county feeds are fetched.
   */
  public setData(items: NewsItem[]): void {
    this.allItems = items;
    this.setCount(items.length);
    this.render();
  }

  /** Start the 15-minute auto-refresh cycle. */
  public startAutoRefresh(fetchFn: () => Promise<void>): void {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => {
      void fetchFn();
    }, REFRESH_INTERVAL_MS);
  }

  public stopAutoRefresh(): void {
    if (this.refreshTimer !== null) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private matchIsland(item: NewsItem): IslandFilter | null {
    const text = `${item.title} ${item.source}`.toLowerCase();
    for (const [island, keywords] of Object.entries(ISLAND_KEYWORDS) as Array<[Exclude<IslandFilter, 'all'>, string[]]>) {
      for (const kw of keywords) {
        if (text.includes(kw)) return island;
      }
    }
    return null;
  }

  private render(): void {
    const filtered = this.activeFilter === 'all'
      ? this.allItems
      : this.allItems.filter(item => this.matchIsland(item) === this.activeFilter);

    if (filtered.length === 0 && this.allItems.length === 0) {
      this.setContent('<div class="panel-empty">No community reports available.</div>');
      return;
    }

    if (filtered.length === 0) {
      this.setContent(`<div class="panel-empty">No reports for ${ISLAND_LABELS[this.activeFilter]}.</div>`);
      return;
    }

    const disclaimerHtml = `<div style="padding:8px 10px;background:rgba(231,76,60,0.08);border-bottom:1px solid var(--border);font-size:10px;color:#e74c3c;line-height:1.3">
  ${escapeHtml(DISCLAIMER)}
</div>`;

    const itemsHtml = filtered.map(item => this.renderReport(item)).join('');
    this.setContent(disclaimerHtml + itemsHtml);
  }

  private renderReport(item: NewsItem): string {
    const island = this.matchIsland(item);
    const islandBadge = island
      ? `<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:var(--bg-secondary);color:var(--text-secondary)">${escapeHtml(ISLAND_LABELS[island])}</span>`
      : '';

    const description = '';

    return `<a href="${sanitizeUrl(item.link)}" target="_blank" rel="noopener" style="display:block;padding:8px 10px;border-bottom:1px solid var(--border);text-decoration:none;color:inherit">
  <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
    <span style="font-size:10px;color:var(--text-secondary)">${escapeHtml(item.source)}</span>
    ${islandBadge}
    <span style="flex:1"></span>
    <span style="font-size:10px;color:var(--text-dim)">${formatTime(item.pubDate)}</span>
  </div>
  <div style="font-size:12px;font-weight:600;color:var(--text-primary);line-height:1.3">${escapeHtml(item.title)}</div>
  ${description}
</a>`;
  }

  public destroy(): void {
    this.stopAutoRefresh();
    for (const [btn, handler] of this.filterClickHandlers) {
      btn.removeEventListener('click', handler);
    }
    this.filterClickHandlers.clear();
    super.destroy();
  }
}
