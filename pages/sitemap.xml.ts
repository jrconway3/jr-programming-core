import type { GetServerSideProps } from 'next';
import { getSitemapData } from 'app/repositories/projects';

const BASE_URL = 'https://jrconway.net';

type SitemapEntry = {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildSitemap(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(e.url)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export default function SitemapXml() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const now = new Date().toISOString();

  const staticPages: SitemapEntry[] = [
    { url: BASE_URL, lastmod: now, changefreq: 'monthly', priority: '1.0' },
    { url: `${BASE_URL}/projects`, lastmod: now, changefreq: 'monthly', priority: '0.9' },
    { url: `${BASE_URL}/experience`, lastmod: now, changefreq: 'monthly', priority: '0.8' },
    { url: `${BASE_URL}/about`, lastmod: now, changefreq: 'monthly', priority: '0.7' },
    { url: `${BASE_URL}/contact`, lastmod: now, changefreq: 'monthly', priority: '0.6' },
  ];

  const { projects, jobs } = await getSitemapData();

  const projectPages: SitemapEntry[] = projects
    .filter((p) => p.shortcode)
    .map((p) => ({
      url: `${BASE_URL}/projects/${p.shortcode}`,
      lastmod: p.updated_at.toISOString(),
      changefreq: 'yearly',
      priority: '0.7',
    }));

  const jobPages: SitemapEntry[] = jobs
    .filter((j) => j.shortcode)
    .map((j) => ({
      url: `${BASE_URL}/experience/${j.shortcode}`,
      lastmod: j.updated_at.toISOString(),
      changefreq: 'yearly',
      priority: '0.6',
    }));

  const sitemap = buildSitemap([...staticPages, ...projectPages, ...jobPages]);

  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.write(sitemap);
  res.end();

  return { props: {} };
};
