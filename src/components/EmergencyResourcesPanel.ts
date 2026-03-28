import { Panel } from './Panel';
import { escapeHtml } from '@/utils/sanitize';

interface ResourceContact {
  name: string;
  phone?: string;
  url?: string;
  description?: string;
}

interface ResourceSection {
  title: string;
  contacts: ResourceContact[];
  collapsed?: boolean;
}

const SECTIONS: ResourceSection[] = [
  {
    title: 'Emergency Contacts',
    contacts: [
      { name: '911 Emergency', phone: '911', description: 'Police, Fire, Ambulance' },
      { name: 'Hawaii Emergency Management Agency', phone: '808-733-4300', url: 'https://dod.hawaii.gov/hiema/' },
      { name: 'American Red Cross Hawaii', phone: '808-734-2101', url: 'https://www.redcross.org/local/hawaii.html' },
      { name: 'Hawaii 211', phone: '211', url: 'https://www.auw211.org/', description: 'Social services, shelter info, disaster assistance' },
    ],
  },
  {
    title: 'County Emergency Management',
    contacts: [
      { name: 'Honolulu (Oahu)', phone: '808-723-8960', url: 'https://www.honolulu.gov/dem/' },
      { name: 'Maui County', phone: '808-270-7285', url: 'https://www.mauicounty.gov/agencies-departments/emergency-management/' },
      { name: 'Hawaii County (Big Island)', phone: '808-935-0031', url: 'https://www.hawaiicounty.gov/departments/civil-defense' },
      { name: 'Kauai County', phone: '808-241-1800', url: 'https://www.kauai.gov/KauaiEmergencyManagementAgency' },
    ],
    collapsed: true,
  },
  {
    title: 'FEMA Resources',
    contacts: [
      { name: 'Disaster Assistance', phone: '800-621-3362', url: 'https://www.disasterassistance.gov/', description: 'Register for FEMA assistance' },
      { name: 'SBA Disaster Loans', url: 'https://www.sba.gov/funding-programs/disaster-assistance', description: 'Low-interest loans for businesses and homeowners' },
      { name: 'FEMA Hawaii', url: 'https://www.fema.gov/disaster/current#702' },
    ],
    collapsed: true,
  },
  {
    title: 'Preparedness',
    contacts: [
      { name: 'HI-EMA Emergency Kits', url: 'https://dod.hawaii.gov/hiema/get-ready/', description: 'Build an emergency supply kit' },
      { name: 'Family Emergency Plan', url: 'https://dod.hawaii.gov/hiema/get-ready/make-a-plan/', description: 'Create your emergency plan' },
      { name: 'Tsunami Evacuation Zones', url: 'https://dod.hawaii.gov/hiema/tsunami-evacuation-zone/', description: 'Know your evacuation zone' },
      { name: 'Hawaii Emergency Alerts', url: 'https://www.weather.gov/hfo/', description: 'NWS Honolulu forecast office' },
    ],
    collapsed: true,
  },
];

/**
 * EmergencyResourcesPanel -- semi-static panel with critical emergency
 * information organized in collapsible sections.
 * Panel ID: 'emergency-resources'
 */
export class EmergencyResourcesPanel extends Panel {
  private expandedSections: Set<number> = new Set([0]); // First section expanded by default

  constructor() {
    super({
      id: 'emergency-resources',
      title: 'Emergency Resources',
      showCount: false,
      trackActivity: false,
      infoTooltip: 'Critical emergency contacts, county emergency management offices, FEMA resources, and preparedness links for Hawaii.',
    });
    this.render();
    this.content.addEventListener('click', (e) => {
      const header = (e.target as HTMLElement).closest<HTMLElement>('[data-section-toggle]');
      if (!header) return;
      const idx = parseInt(header.dataset.sectionToggle ?? '', 10);
      if (!Number.isFinite(idx)) return;
      if (this.expandedSections.has(idx)) {
        this.expandedSections.delete(idx);
      } else {
        this.expandedSections.add(idx);
      }
      this.render();
    });
  }

  private render(): void {
    const sectionsHtml = SECTIONS.map((section, idx) => {
      const expanded = this.expandedSections.has(idx);
      const chevron = expanded ? '&#9660;' : '&#9654;';
      const contactsHtml = expanded
        ? `<div class="emergency-section-body" style="padding:4px 0">${section.contacts.map(c => this.renderContact(c)).join('')}</div>`
        : '';

      return `<div class="emergency-section" style="border-bottom:1px solid var(--border)">
  <div data-section-toggle="${idx}" style="display:flex;align-items:center;gap:6px;padding:8px 10px;cursor:pointer;user-select:none">
    <span style="font-size:10px;color:var(--text-dim);width:12px">${chevron}</span>
    <span style="font-size:12px;font-weight:600;color:var(--text-primary)">${escapeHtml(section.title)}</span>
    <span style="font-size:10px;color:var(--text-dim)">(${section.contacts.length})</span>
  </div>
  ${contactsHtml}
</div>`;
    }).join('');

    this.setContent(sectionsHtml);
  }

  private renderContact(contact: ResourceContact): string {
    const phonePart = contact.phone
      ? `<a href="tel:${escapeHtml(contact.phone.replace(/[^0-9+]/g, ''))}" style="color:var(--accent-primary);text-decoration:none;font-size:11px;white-space:nowrap">${escapeHtml(contact.phone)}</a>`
      : '';

    const urlPart = contact.url
      ? `<a href="${escapeHtml(contact.url)}" target="_blank" rel="noopener" style="color:var(--accent-primary);text-decoration:none;font-size:10px;word-break:break-all">Website</a>`
      : '';

    const descPart = contact.description
      ? `<div style="font-size:10px;color:var(--text-dim);margin-top:2px">${escapeHtml(contact.description)}</div>`
      : '';

    return `<div style="padding:6px 10px 6px 28px;border-top:1px solid var(--border-subtle, rgba(128,128,128,0.1))">
  <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
    <span style="font-size:12px;color:var(--text-primary);font-weight:500">${escapeHtml(contact.name)}</span>
    ${phonePart}
    ${urlPart}
  </div>
  ${descPart}
</div>`;
  }
}
