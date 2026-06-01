import type { GetServerSideProps } from 'next';

const ROBOTS_CONTENT = `User-agent: *
Allow: /
Sitemap: https://jrconway.net/sitemap.xml
`;

export default function RobotsTxt() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.write(ROBOTS_CONTENT);
  res.end();
  return { props: {} };
};
