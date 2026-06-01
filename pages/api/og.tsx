import { ImageResponse } from 'next/og';

export const config = { runtime: 'edge' };

export default async function OgImage(req: Request) {
  const { origin } = new URL(req.url);

  const [fontAngled, fontRegular] = await Promise.all([
    fetch(`${origin}/fonts/commodore-64-angled-1.2.ttf`).then((r) => r.arrayBuffer()),
    fetch(`${origin}/fonts/commodore-64-6.3.ttf`).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#0f172a',
        }}
      >
        {/* Full-canvas CRT scanlines */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            zIndex: 5,
            background:
              'repeating-linear-gradient(rgba(168,85,247,0.04) 0px, rgba(168,85,247,0.04) 1px, transparent 1px, transparent 4px)',
          }}
        />

        {/* Portrait — cropped frame centered vertically, fades inside so they clip with the image */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: 75,
            right: 0,
            width: 420,
            height: 480,
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          <img
            src={`${origin}/images/my-portrait.png`}
            width={420}
            height={480}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              objectFit: 'cover',
              objectPosition: '50% 8%',
              zIndex: 1,
            }}
          />

          {/* West fade */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0, left: 0,
              width: 420,
              height: 480,
              zIndex: 2,
              background:
                'linear-gradient(to right, rgba(15,23,42,1) 0%, rgba(15,23,42,0.96) 7%, rgba(15,23,42,0.85) 16%, rgba(15,23,42,0.66) 27%, rgba(15,23,42,0.42) 40%, rgba(15,23,42,0.18) 54%, rgba(15,23,42,0) 65%)',
            }}
          />

          {/* North fade */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0, left: 0,
              width: 420,
              height: 90,
              zIndex: 3,
              background:
                'linear-gradient(to bottom, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.62) 32%, rgba(15,23,42,0.24) 65%, rgba(15,23,42,0) 100%)',
            }}
          />

          {/* South fade */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              bottom: 0, left: 0,
              width: 420,
              height: 110,
              zIndex: 3,
              background:
                'linear-gradient(to top, rgba(15,23,42,1) 0%, rgba(15,23,42,0.75) 28%, rgba(15,23,42,0.35) 58%, rgba(15,23,42,0) 100%)',
            }}
          />

        </div>

        {/* Text content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 64px',
            width: 830,
            zIndex: 10,
          }}
        >
          {/* Logo — <¿RProgramming style */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
            {/* < rendered in fallback font — Commodore 64 Angled maps this glyph wrong */}
            <span style={{ color: '#c084fc', fontSize: 22, lineHeight: 1 }}>
              {'<'}
            </span>
            <span
              style={{
                fontFamily: '"Commodore 64 Angled"',
                color: '#c084fc',
                fontSize: 20,
                lineHeight: 1,
                display: 'flex',
                transform: 'scaleY(-1)',
              }}
            >
              {'?'}
            </span>
            <span style={{ fontFamily: '"Commodore 64 Angled"', color: '#c084fc', fontSize: 20, lineHeight: 1 }}>
              RProgramming
            </span>
          </div>

          {/* Eyebrow */}
          <p
            style={{
              fontFamily: '"Commodore 64"',
              color: '#a78bfa',
              fontSize: 13,
              letterSpacing: '0.22em',
              margin: '0 0 16px',
              lineHeight: 1.6,
            }}
          >
            BACKEND DEVELOPER · API INTEGRATIONS · AUTOMATION SYSTEMS
          </p>

          {/* Name */}
          <h1
            style={{
              fontFamily: '"Commodore 64 Angled"',
              color: '#c084fc',
              fontSize: 72,
              fontWeight: 400,
              margin: '0 0 20px',
              lineHeight: 1.05,
            }}
          >
            David Conway Jr.
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: '"Commodore 64"',
              color: '#f1f5f9',
              fontSize: 20,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            I help businesses automate workflows, integrate APIs, and scale backend systems
          </p>

          {/* Domain */}
          <p
            style={{
              fontFamily: '"Commodore 64"',
              color: '#6ee7b7',
              fontSize: 16,
              marginTop: 28,
              marginBottom: 0,
            }}
          >
            jrconway.net -&gt;
          </p>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Commodore 64 Angled', data: fontAngled, style: 'normal', weight: 400 },
        { name: 'Commodore 64', data: fontRegular, style: 'normal', weight: 400 },
      ],
    }
  );
}
