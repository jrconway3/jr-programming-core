import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { transformHomeSettings } from 'app/transformers/settings';

describe('home/settings contract', () => {
  it('converts slash-key settings map into derived underscore-key home settings', () => {
    const homeSettings = transformHomeSettings({
      'home/banner/title': 'Jane Doe',
      'home/banner/subtitle': 'Systems Engineer / Web Developer',
      'home/status/enabled': 'true',
      'home/status/state': 'busy',
      'home/status/label': 'Status: Available for Work',
      'home/status/message': 'Looking for a developer to build or improve your system?',
      'home/status/cta/label': 'Contact Me',
      'home/status/cta/href': '/contact#inquiry-form',
    });

    // Keeps underscore fields expected by Home and applies normalization behavior.
    expect(homeSettings.home_banner_title).toBe('Jane Doe');
    expect(homeSettings.home_banner_subtitle).toBe(
      'I help businesses automate workflows, integrate APIs, and scale backend systems',
    );
    expect(homeSettings.show_status_cta).toBe(true);
    expect(homeSettings.home_status_state).toBe('busy');
    expect(homeSettings.display_status_label).toBe('Status: Available');
    expect(homeSettings.display_status_message).toBe('Looking to automate workflows or integrate APIs?');
    expect(homeSettings.display_status_cta_label).toBe('Contact');
    expect(homeSettings.home_status_cta_href).toBe('/contact#inquiry-form');
    expect(homeSettings.status_led_class).toBe('status-led status-led--busy');
  });

  it('wires Home and SettingsContext through homeSettings, not raw settings map keys', () => {
    const homePageSource = readFileSync(resolve(process.cwd(), 'pages/index.tsx'), 'utf8');
    const settingsContextSource = readFileSync(resolve(process.cwd(), 'components/SettingsContext.tsx'), 'utf8');

    expect(homePageSource).toContain('const { homeSettings } = useSettings();');
    expect(homePageSource).not.toMatch(/settings\.(show_status_cta|home_|display_status_|status_led_class)/);

    expect(settingsContextSource).toContain('homeSettings: HomeSettings;');
    expect(settingsContextSource).toContain('const homeSettings = transformHomeSettings(settings);');
    expect(settingsContextSource).toContain('value={{ settings, homeSettings, isLoaded }}');
  });
});
