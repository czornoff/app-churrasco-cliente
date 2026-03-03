import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    return {
        name: 'MandeBem - Apps Inteligentes',
        short_name: 'Calculadora de Churrasco',
        description: 'A solução inteligente para organizar seu churrasco sem desperdícios.',
        start_url: `${basePath}/`,
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#e53935',
        icons: [
            {
                src: `${basePath}/icon-192.png`,
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: `${basePath}/icon-512.png`,
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
