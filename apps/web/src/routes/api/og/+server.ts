import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

let fontBuffer: ArrayBuffer | null = null;

async function getFont() {
  if (!fontBuffer) {
    const response = await fetch(
      'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf'
    );
    fontBuffer = await response.arrayBuffer();
  }

  return fontBuffer;
}

function clampText(value: string | null, fallback: string, maxLength: number) {
  const text = (value || fallback).trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
}

export const GET = async ({ url }) => {
  const title = clampText(url.searchParams.get('title'), 'TypingScholar', 72);
  const subtitle = clampText(
    url.searchParams.get('subtitle'),
    'Adaptive touch typing lessons for every language, script, and keyboard layout.',
    150
  );
  const fontData = await getFont();

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '1200px',
          height: '630px',
          padding: '68px',
          backgroundColor: '#111319',
          backgroundImage:
            'radial-gradient(circle at 18% 18%, rgba(255, 197, 108, 0.18), transparent 28%), radial-gradient(circle at 85% 15%, rgba(65, 228, 192, 0.14), transparent 30%), linear-gradient(135deg, #111319 0%, #1d2025 100%)',
          color: '#f6f1e8',
          fontFamily: 'Inter',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '30px',
                      fontWeight: 700,
                      color: '#ffc56c',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    },
                    children: 'TypingScholar',
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      gap: '10px',
                      color: '#41e4c0',
                      fontSize: '26px',
                    },
                    children: ['Aa', '××‘', 'Ð–Ð¶', 'í•œê¸€', 'à¤•à¤–'].map((sample) => ({
                      type: 'span',
                      props: { children: sample },
                    })),
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
                gap: '28px',
                maxWidth: '940px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: title.length > 48 ? '70px' : '82px',
                      lineHeight: 1.04,
                      fontWeight: 700,
                      color: '#ffffff',
                    },
                    children: title,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '30px',
                      lineHeight: 1.35,
                      color: '#d6c4ac',
                      maxWidth: '860px',
                    },
                    children: subtitle,
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
                gap: '18px',
                color: '#111319',
                fontSize: '22px',
                fontWeight: 700,
              },
              children: ['WPM tracking', 'Adaptive lessons', 'School dashboards'].map((label) => ({
                type: 'div',
                props: {
                  style: {
                    padding: '12px 18px',
                    backgroundColor: '#ffc56c',
                    borderRadius: '8px',
                  },
                  children: label,
                },
              })),
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

  const pngData = new Resvg(svg, {
    background: '#111319',
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  })
    .render()
    .asPng();

  return new Response(new Uint8Array(pngData), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
