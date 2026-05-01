import { ImageResponse } from '@sveltejs/kit';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Pre-fetch fonts (if running locally or serverless, we fetch once)
let fontBuffer: ArrayBuffer | null = null;

async function getFont() {
  if (!fontBuffer) {
    // Fetch Inter from jsdelivr as it's very reliable
    const response = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf');
    fontBuffer = await response.arrayBuffer();
  }
  return fontBuffer;
}

export const GET = async ({ url }) => {
  const wpm = url.searchParams.get('wpm') || '0';
  const accuracy = url.searchParams.get('acc') || '0';
  const language = url.searchParams.get('lang') || 'English';

  const fontData = await getFont();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1200px',
          height: '630px',
          backgroundColor: '#1d2025',
          backgroundImage: 'radial-gradient(ellipse at 50% -20%, rgba(240, 165, 0, 0.15), transparent 70%)',
          color: '#e3e2e6',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '32px',
                      fontWeight: 700,
                      color: '#f0a500',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    },
                    children: 'TypeForge',
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '84px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '60px',
                textAlign: 'center',
                lineHeight: '1.2',
              },
              children: `Official Typing Certificate`,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                gap: '80px',
                marginBottom: '40px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '24px',
                      padding: '40px 60px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '96px',
                            fontWeight: 700,
                            color: '#41e4c0',
                            lineHeight: '1',
                          },
                          children: wpm,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '24px',
                            color: '#cac4d0',
                            marginTop: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                          },
                          children: 'WPM',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '24px',
                      padding: '40px 60px',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '96px',
                            fontWeight: 700,
                            color: '#f0a500',
                            lineHeight: '1',
                          },
                          children: `${accuracy}%`,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '24px',
                            color: '#cac4d0',
                            marginTop: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                          },
                          children: 'Accuracy',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: '32px',
                color: '#cac4d0',
                marginTop: '20px',
              },
              children: `Tested in ${language}`,
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: fontData,
          weight: 700,
          style: 'normal',
        },
      ],
    }
  );

  const resvg = new Resvg(svg, {
    background: '#1d2025',
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });

  const pngData = resvg.render().asPng();

  return new Response(pngData, {
    headers: {
      'Content-Type': 'image/png',
      // Cache heavily as this image is mostly static based on URL query
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
