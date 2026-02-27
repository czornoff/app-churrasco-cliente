import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'MandeBem - Apps Inteligentes',
        short_name: 'Calculadora de Churrasco',
        description: 'A solução inteligente para organizar seu churrasco sem desperdícios.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#e53935',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
