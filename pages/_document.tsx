import { Html, Head, Main, NextScript } from 'next/document';

const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'David Conway Jr.',
  url: 'https://jrconway.net',
  jobTitle: 'Backend Developer',
  sameAs: ['https://github.com/jrconway3', 'https://linkedin.com/in/jrconway'],
  knowsAbout: ['Laravel', 'PHP', 'Node.js', 'REST APIs', 'Workflow Automation', 'MySQL'],
  description: 'Self-taught backend developer with 15+ years of production experience in Laravel, PHP, REST APIs, and automation systems.',
};

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD).replace(/</g, '\\u003c') }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
