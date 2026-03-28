import { Panel } from './Panel';
import type { NewsItem } from '@/types';
import { formatTime } from '@/utils';
import { escapeHtml, sanitizeUrl } from '@/utils/sanitize';

/** Hawaii news source metadata for display badges. */
const SOURCE_META: Record<string, { color: string; abbr: string }> = {
  'Hawaii News Now': { color: '#c0392b', abbr: 'HNN' },
  'Civil Beat': { color: '#2980b9', abbr: 'CB' },
  'Maui Now': { color: '#27ae60', abbr: 'MN' },
  'Big Island Now': { color: '#8e44ad', abbr: 'BIN' },
  'Kauai Now': { color: '#d35400', abbr: 'KN' },
};

type SourceFilter = 'all' | string;

const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * HawaiiNewsPanel -- aggregates Hawaii local news from RSS feeds configured
 * in the emergency variant's feeds.ts `local-news` key.
 * Panel ID: 'local-news'
 */
export class HawaiiNewsPanel extends Panel {
  private allItems: NewsItem[] = [];
  private activeFilter: SourceFilter = 'all';
  private filterBar: HTMLElement | null = null;
  private filterClickHandlers: Map<HTMLButtonElement, () => void> = new Map();
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super({
      id: 'local-news',
      title: 'Hawaii News',
      showCount: true,
      trackActivity: true,
      infoTooltip: 'Aggregates local Hawaii news from Hawaii News Now, Civil Beat, Maui Now, Big Island Now, and Kauai Now. Auto-refreshes every 15 minutes.',
    });
    this.createFilterBar();
  }

  /** Create the source filter bar between header and content. */
  private createFilterBar(): void {
    this.filterBar = document.createElement('div');
    this.filterBar.className = 'hawaii-news-filters';
    this.filterBar.style.cssText = 'display:flex;gap:4px;padding:6px 10px;flex-wrap:wrap;border-bottom:1px solid var(--border)';

    const allBtn = this.makeFilterButton('All', 'all', true);
    this.filterBar.appendChild(allBtn);

    for (const [source, meta] of Object.entries(SOURCE_META)) {
      const btn = this.makeFilterButton(meta.abbr, source, false);
      btn.title = source;
      this.filterBar.appendChild(btn);
    }

    this.element.insertBefore(this.filterBar, this.content);
  }

  private makeFilterButton(label: string, filterValue: string, active: boolean): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.className = `hawaii-news-filter-btn${active ? ' active' : ''}`;
    btn.textContent = label;
    btn.dataset.filter = filterValue;
    btn.style.cssText = `font-size:10px;padding:2px 8px;border-radius:10px;border:1px solid var(--border);background:${active ? 'var(--accent-primary)' : 'transparent'};color:${active ? '#fff' : 'var(--text-secondary)'};cursor:pointer`;

    const handler = () => this.setFilter(filterValue);
    btn.addEventListener('click', handler);
    this.filterClickHandlers.set(btn, handler);
    return btn;
  }

  private setFilter(filter: SourceFilter): void {
    this.activeFilter = filter;
    if (this.filterBar) {
      for (const btn of this.filterBar.querySelectorAll<HTMLButtonElement>('.hawaii-news-filter-btn')) {
        const isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.style.background = isActive ? 'var(--accent-primary)' : 'transparent';
        btn.style.color = isActive ? '#fff' : 'var(--text-secondary)';
      }
    }
    this.render();
  }

  /**
   * Receive news items from the RSS data pipeline. Called externally when
   * the emergency variant's local-news feeds are fetched.
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

  private render(): void {
    const filtered = this.activeFilter === 'all'
      ? this.allItems
      : this.allItems.filter(item => item.source === this.activeFilter);

    if (filtered.length === 0) {
      this.setContent('<div class="panel-empty">No Hawaii news articles available.</div>');
      return;
    }

    const html = filtered.map(item => this.renderArticle(item)).join('');
    this.setContent(html);
  }

  private renderArticle(item: NewsItem): string {
    const meta = SOURCE_META[item.source];
    const badge = meta
      ? `<span style="flex-shrink:0;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:${meta.color}22;color:${meta.color}">${escapeHtml(meta.abbr)}</span>`
      : `<span style="flex-shrink:0;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;background:var(--bg-secondary);color:var(--text-secondary)">${escapeHtml(item.source)}</span>`;

    const description = '';

    return `<a href="${sanitizeUrl(item.link)}" target="_blank" rel="noopener" style="display:block;padding:8px 10px;border-bottom:1px solid var(--border);text-decoration:none;color:inherit">
  <div style="display:flex;align-items:flex-start;gap:6px">
    ${badge}
    <div style="flex:1;min-width:0">
      <div style="font-size:12px;font-weight:600;color:var(--text-primary);line-height:1.3">${escapeHtml(item.title)}</div>
      ${description}
      <div style="font-size:10px;color:var(--text-dim);margin-top:3px">${escapeHtml(item.source)} &middot; ${formatTime(item.pubDate)}</div>
    </div>
  </div>
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
