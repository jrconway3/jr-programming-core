import type { Settings } from '@prisma/client';
import type { PublicSettingRecord } from 'app/models/settings';
import { siteSettingDefaults } from 'app/services/settings';

export function transformSettings(settings: Settings[]): PublicSettingRecord[] {
  return settings.map((setting) => ({
    id: setting.id,
    key: setting.key,
    value: setting.value,
  }));
}

// ─── Home-page Settings ────────────────────────────────────────────────────

const legacyHeroSubtitles = new Set([
  'web software engineer & programmer',
  'systems engineer / web developer',
]);

const legacyStatusMessages = new Set([
  'looking for a developer to build or improve your system?',
]);

const legacyStatusLabels = new Set([
  'status: available for work',
]);

export type HomeSettings = {
  home_banner_title: string;
  home_banner_subtitle: string;
  home_banner_eyebrow: string;
  home_banner_supporting_line1: string;
  home_banner_supporting_line2: string;
  home_banner_cta_primary_label: string;
  home_banner_cta_primary_href: string;
  home_banner_cta_secondary_label: string;
  home_banner_cta_secondary_href: string;
  home_status_enabled: string;
  home_status_state: string;
  home_status_label: string;
  home_status_message: string;
  home_status_cta_label: string;
  home_status_cta_href: string;
  // Derived display fields
  show_status_cta: boolean;
  display_status_label: string;
  display_status_message: string;
  display_status_cta_label: string;
  status_led_class: string;
};

export function transformHomeSettings(map: Record<string, string>): HomeSettings {
  function get(key: string): string {
    return (map[key] ?? siteSettingDefaults[key] ?? '').trim();
  }

  const subtitle = get('home/banner/subtitle');
  const normalizedSubtitle = legacyHeroSubtitles.has(subtitle.toLowerCase())
    ? siteSettingDefaults['home/banner/subtitle']
    : subtitle;

  const statusState = get('home/status/state').toLowerCase();
  const statusEnabledRaw = get('home/status/enabled');
  const statusLabel = get('home/status/label');
  const statusMessage = get('home/status/message');
  const statusCtaLabel = get('home/status/cta/label');

  return {
    home_banner_title: get('home/banner/title'),
    home_banner_subtitle: normalizedSubtitle,
    home_banner_eyebrow: get('home/banner/eyebrow'),
    home_banner_supporting_line1: get('home/banner/supporting/line1'),
    home_banner_supporting_line2: get('home/banner/supporting/line2'),
    home_banner_cta_primary_label: get('home/banner/cta/primary/label'),
    home_banner_cta_primary_href: get('home/banner/cta/primary/href'),
    home_banner_cta_secondary_label: get('home/banner/cta/secondary/label'),
    home_banner_cta_secondary_href: get('home/banner/cta/secondary/href'),
    home_status_enabled: statusEnabledRaw,
    home_status_state: statusState,
    home_status_label: statusLabel,
    home_status_message: statusMessage,
    home_status_cta_label: statusCtaLabel,
    home_status_cta_href: get('home/status/cta/href'),
    show_status_cta: statusEnabledRaw.toLowerCase() !== 'false',
    display_status_label: legacyStatusLabels.has(statusLabel.toLowerCase())
      ? 'Status: Available'
      : statusLabel,
    display_status_message: legacyStatusMessages.has(statusMessage.toLowerCase())
      ? 'Looking to automate workflows or integrate APIs?'
      : statusMessage,
    display_status_cta_label: statusCtaLabel.toLowerCase() === 'contact me' ? 'Contact' : statusCtaLabel,
    status_led_class: statusState === 'busy' ? 'status-led status-led--busy' : 'status-led status-led--available',
  };
}
