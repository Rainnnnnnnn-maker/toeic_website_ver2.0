import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const alt = 'TOEIC重要単語'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          border: '20px solid #000',
        }}
      >
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                 <svg
                    width="100"
                    height="100"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ marginRight: '30px' }}
                >
                    <path
                        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
                        stroke="#000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                        stroke="#000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <h1 style={{ fontSize: 80, fontWeight: 'bold', color: '#000', margin: 0 }}>
                    TOEIC重要単語
                </h1>
            </div>
            
            <p style={{ fontSize: 32, color: '#333', textAlign: 'center', maxWidth: '800px', marginTop: '20px' }}>
            TOEIC頻出の重要単語をAI解説で効率よく学べる
            </p>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
