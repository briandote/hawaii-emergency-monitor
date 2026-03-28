import { Panel } from './Panel';
import { escapeHtml } from '@/utils/sanitize';
import type {
  Alert,
  RoadClosure,
  PowerOutage,
} from '@/generated/server/worldmonitor/emergency/v1/service_server';

/** Unified timeline entry derived from various emergency data sources. */
export interface TimelineEntry {
  id: string;
  type: 'alert' | 'road-closure' | 'power-outage' | 'water-flood';
  title: string;
  description: string;
  startTime: Date;
  updatedAt: Date;
  severity?: string;
}

const TYPE_CONFIG: Record<TimelineEntry['type'], { color: string; icon: string; label: string }> = {
  'alert': { color: '#e74c3c', icon: '\u26A0', label: 'Alert' },
  'road-closure': { color: '#e67e22', icon: '\u26D4', label: 'Road Closure' },
  'power-outage': { color: '#f1c40f', icon: '\u26A1', label: 'Power Outage' },
  'water-flood': { color: '#3498db', icon: '\uD83C\uDF0A', label: 'Water/Flood' },
};

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * EventTimelinePanel -- chronological timeline of emergency events aggregated
 * from active alerts, road closures, and power outages.
 * Panel ID: 'event-timeline'
 */
export class EventTimelinePanel extends Panel {
  private entries: TimelineEntry[] = [];
  private refreshTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    super({
      id: 'event-timeline',
      title: 'Event Timeline',
      showCount: true,
      trackActivity: true,
      infoTooltip: 'Chronological timeline of emergency events aggregated from active alerts, road closures, and power outages. Color-coded by event type.',
    });
    this.showLoading('Waiting for event data...');
  }

  /**
   * Ingest alerts, road closures, and power outages from the emergency API
   * and merge them into a unified timeline.
   */
  public setData(data: {
    alerts?: Alert[];
    closures?: RoadClosure[];
    outages?: PowerOutage[];
  }): void {
    const entries: TimelineEntry[] = [];

    // Alerts
    if (data.alerts) {
      for (const a of data.alerts) {
        const isFlood = /flood|tsunami|surge|water|rain|storm/i.test(a.event) || /flood|tsunami/i.test(a.headline);
        entries.push({
          id: `alert-${a.id}`,
          type: isFlood ? 'water-flood' : 'alert',
          title: a.headline || a.event,
          description: a.areaDesc || '',
          startTime: parseDate(a.onset),
          updatedAt: parseDate(a.onset),
          severity: a.severity,
        });
      }
    }

    // Road closures
    if (data.closures) {
      for (const c of data.closures) {
        entries.push({
          id: `closure-${c.id}`,
          type: 'road-closure',
          title: `${c.road} — ${c.status}`,
          description: c.reason + (c.detour ? ` | Detour: ${c.detour}` : ''),
          startTime: parseDate(c.updatedAt),
          updatedAt: parseDate(c.updatedAt),
        });
      }
    }

    // Power outages
    if (data.outages) {
      for (const o of data.outages) {
        entries.push({
          id: `outage-${o.id}`,
          type: 'power-outage',
          title: `${o.area} — ${o.customersAffected} customers`,
          description: o.cause + (o.estimatedRestoration ? ` | Est. restore: ${o.estimatedRestoration}` : ''),
          startTime: parseDate(o.startTime),
          updatedAt: parseDate(o.startTime),
        });
      }
    }

    // Sort by most recent first
    entries.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    this.entries = entries;
    this.setCount(entries.length);
    this.render();
  }

  /** Start auto-refresh. */
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
    if (this.entries.length === 0) {
      this.setContent('<div class="panel-empty">No emergency events reported.</div>');
      return;
    }

    const html = `<div class="event-timeline" style="position:relative;padding-left:20px">
  <div class="event-timeline-line" style="position:absolute;left:9px;top:0;bottom:0;width:2px;background:var(--border)"></div>
  ${this.entries.map(entry => this.renderEntry(entry)).join('')}
</div>`;

    this.setContent(html);
  }

  private renderEntry(entry: TimelineEntry): string {
    const cfg = TYPE_CONFIG[entry.type];
    const startStr = formatRelative(entry.startTime);
    const updatedStr = entry.updatedAt.getTime() !== entry.startTime.getTime()
      ? ` &middot; Updated ${formatRelative(entry.updatedAt)}`
      : '';

    const severityBadge = entry.severity
      ? `<span style="font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;background:${cfg.color}22;color:${cfg.color};margin-left:4px">${escapeHtml(entry.severity)}</span>`
      : '';

    return `<div class="event-timeline-entry" style="position:relative;padding:8px 0 8px 12px;border-bottom:1px solid var(--border-subtle, rgba(128,128,128,0.08))">
  <div class="event-timeline-dot" style="position:absolute;left:-15px;top:12px;width:10px;height:10px;border-radius:50%;background:${cfg.color};border:2px solid var(--bg-primary)"></div>
  <div style="display:flex;align-items:center;gap:4px;margin-bottom:3px">
    <span style="font-size:12px">${cfg.icon}</span>
    <span style="font-size:10px;font-weight:600;color:${cfg.color}">${escapeHtml(cfg.label)}</span>
    ${severityBadge}
  </div>
  <div style="font-size:12px;font-weight:600;color:var(--text-primary);line-height:1.3">${escapeHtml(entry.title)}</div>
  <div style="font-size:11px;color:var(--text-dim);margin-top:2px;line-height:1.3">${escapeHtml(entry.description)}</div>
  <div style="font-size:10px;color:var(--text-dim);margin-top:4px">
    Event began ${escapeHtml(startStr)}${updatedStr}
  </div>
</div>`;
  }

  public destroy(): void {
    this.stopAutoRefresh();
    super.destroy();
  }
}

/** Parse a date string, returning epoch 0 on failure. */
function parseDate(str: string): Date {
  const d = new Date(str);
  return Number.isFinite(d.getTime()) ? d : new Date(0);
}

/** Format a date as relative time (e.g., "3h ago", "2d ago"). */
function formatRelative(d: Date): string {
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 0 || !Number.isFinite(diff)) return 'just now';

  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
