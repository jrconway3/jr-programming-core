export type SiteSettingField = {
  key: string;
  label: string;
  description: string;
  inputType: 'text' | 'textarea';
  placeholder?: string;
  rows?: number;
};

export type SiteSettingSection = {
  id: string;
  title: string;
  description: string;
  fields: SiteSettingField[];
};

export const siteSettingDefaults: Record<string, string> = {
  'home/banner/eyebrow': 'Backend Developer • API Integrations • Automation Systems',
  'home/banner/title': 'David Conway Jr.',
  'home/banner/subtitle': 'I help businesses automate workflows, integrate APIs, and scale backend systems',
  'home/banner/supporting/line1': '10+ years experience building real-world systems for production businesses',
  'home/banner/supporting/line2': 'Specialized in PHP, APIs, automation, and database systems',
  'home/banner/cta/primary/label': 'View My Work',
  'home/banner/cta/primary/href': '#projects',
  'home/banner/cta/secondary/label': 'Hire Me',
  'home/banner/cta/secondary/href': '/contact',
  'home/status/enabled': 'true',
  'home/status/state': 'available',
  'home/status/label': 'Status: Available',
  'home/status/message': 'Looking to automate workflows or integrate APIs?',
  'home/status/cta/label': 'Contact Me',
  'home/status/cta/href': '/contact#inquiry-form',
  'footer/copy/name': 'David Conway Jr.',
  'footer/copy/rights': 'all rights reserved.',
  'footer/copy/built': 'Built using Next.js and Tailwind CSS, with assistance from GitHub Copilot.',
  'footer/font/name': 'Commodore 64',
  'footer/font/author': 'Devin Cook',
  'footer/font/url': 'https://www.dafont.com/commodore-64.font',
};

export const editableSiteSettingSections: SiteSettingSection[] = [
  {
    id: 'home-hero',
    title: 'Homepage Hero',
    description: 'Control the core homepage messaging and CTA targets directly from the database-backed settings module.',
    fields: [
      {
        key: 'home/banner/eyebrow',
        label: 'Eyebrow',
        description: 'Short label above the hero title.',
        inputType: 'text',
      },
      {
        key: 'home/banner/title',
        label: 'Title',
        description: 'Primary name or brand shown in the hero.',
        inputType: 'text',
      },
      {
        key: 'home/banner/subtitle',
        label: 'Headline',
        description: 'Main conversion-focused value proposition.',
        inputType: 'textarea',
        rows: 3,
      },
      {
        key: 'home/banner/supporting/line1',
        label: 'Supporting Line 1',
        description: 'First supporting proof point beneath the headline.',
        inputType: 'text',
      },
      {
        key: 'home/banner/supporting/line2',
        label: 'Supporting Line 2',
        description: 'Second supporting proof point beneath the headline.',
        inputType: 'text',
      },
      {
        key: 'home/banner/cta/primary/label',
        label: 'Primary CTA Label',
        description: 'Button text for the main homepage CTA.',
        inputType: 'text',
      },
      {
        key: 'home/banner/cta/primary/href',
        label: 'Primary CTA Link',
        description: 'Relative path or page anchor for the main CTA.',
        inputType: 'text',
        placeholder: '#projects',
      },
      {
        key: 'home/banner/cta/secondary/label',
        label: 'Secondary CTA Label',
        description: 'Button text for the secondary CTA.',
        inputType: 'text',
      },
      {
        key: 'home/banner/cta/secondary/href',
        label: 'Secondary CTA Link',
        description: 'Relative path or page anchor for the secondary CTA.',
        inputType: 'text',
        placeholder: '/contact',
      },
    ],
  },
  {
    id: 'home-status-cta',
    title: 'Homepage Status CTA',
    description: 'Control the retro status indicator and the top contact CTA funnel on the homepage.',
    fields: [
      {
        key: 'home/status/enabled',
        label: 'Enable Status CTA',
        description: 'Set to true or false to show or hide the status CTA block.',
        inputType: 'text',
        placeholder: 'true',
      },
      {
        key: 'home/status/state',
        label: 'Status State',
        description: 'Use available or busy to adjust the indicator color and emphasis.',
        inputType: 'text',
        placeholder: 'available',
      },
      {
        key: 'home/status/label',
        label: 'Status Label',
        description: 'Upper label shown next to the blinking status indicator.',
        inputType: 'text',
      },
      {
        key: 'home/status/message',
        label: 'Status Message',
        description: 'Primary conversion copy shown in the status CTA block.',
        inputType: 'text',
      },
      {
        key: 'home/status/cta/label',
        label: 'Status CTA Label',
        description: 'Button label in the status CTA block.',
        inputType: 'text',
      },
      {
        key: 'home/status/cta/href',
        label: 'Status CTA Link',
        description: 'Relative path or page anchor for the status CTA button.',
        inputType: 'text',
        placeholder: '/contact#inquiry-form',
      },
    ],
  },
  {
    id: 'footer-copy',
    title: 'Footer Copy',
    description: 'Edit footer branding, copy, and attribution details for the global site footer.',
    fields: [
      {
        key: 'footer/copy/year',
        label: 'Footer Year',
        description: 'Year shown in the copyright line.',
        inputType: 'text',
      },
      {
        key: 'footer/copy/name',
        label: 'Footer Name',
        description: 'Name shown in the copyright line.',
        inputType: 'text',
      },
      {
        key: 'footer/copy/rights',
        label: 'Rights Text',
        description: 'Text shown after the name in the copyright line.',
        inputType: 'text',
        placeholder: 'all rights reserved.',
      },
      {
        key: 'footer/copy/built',
        label: 'Built With Copy',
        description: 'Secondary footer line describing the stack or build details.',
        inputType: 'textarea',
        rows: 2,
      },
      {
        key: 'footer/font/name',
        label: 'Font Name',
        description: 'Font name shown in the attribution line.',
        inputType: 'text',
      },
      {
        key: 'footer/font/author',
        label: 'Font Author',
        description: 'Author name shown in the attribution line.',
        inputType: 'text',
      },
      {
        key: 'footer/font/url',
        label: 'Font Attribution URL',
        description: 'Attribution link URL for the footer font.',
        inputType: 'text',
        placeholder: 'https://www.dafont.com/commodore-64.font',
      },
    ],
  },
];

export const editableSiteSettingKeys = editableSiteSettingSections.flatMap((section) => (
  section.fields.map((field) => field.key)
));

type SettingEntry = {
  key: string;
  value: string;
};

export function mergeSettingsWithDefaults(entries: SettingEntry[]): Record<string, string> {
  const merged = { ...siteSettingDefaults };
  const seenKeys = new Set<string>();

  for (const entry of entries) {
    if (seenKeys.has(entry.key)) {
      continue;
    }

    merged[entry.key] = entry.value;
    seenKeys.add(entry.key);
  }

  return merged;
}

export function getSettingValue(settings: Record<string, string>, key: string): string {
  return settings[key] ?? siteSettingDefaults[key] ?? '';
}