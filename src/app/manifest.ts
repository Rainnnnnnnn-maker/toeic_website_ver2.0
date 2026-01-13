import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TOEIC重要単語',
    short_name: 'TOEIC単語',
    description: 'TOEIC頻出の重要単語をAI解説、AI例文で効率よく学べる',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.png',
        sizes: '150x150',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '150x150',
        type: 'image/png',
      },
    ],
  }
}
