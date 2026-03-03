import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Tenant } from '@/models/Schemas';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tenantSlug = searchParams.get('tenant');
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

    if (!tenantSlug) {
        return new NextResponse('Tenant parameter is required', { status: 400 });
    }

    try {
        await connectDB();
        const tenant = await Tenant.findOne({ slug: tenantSlug }).lean();

        if (!tenant) {
            return new NextResponse('Tenant not found', { status: 404 });
        }

        const fallbackName = tenant.name || 'App Churrasco';

        const manifest = {
            name: fallbackName,
            short_name: fallbackName.length > 12 ? fallbackName.substring(0, 12) : fallbackName,
            description: `Aplicativo oficial de ${fallbackName}`,
            start_url: `${basePath}/${tenantSlug}`,
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: '#e53935',
            icons: [
                {
                    src: tenant.logoUrl || `${basePath}/icon-192.png`,
                    sizes: '192x192',
                    type: 'image/png',
                },
                {
                    src: tenant.logoUrl || `${basePath}/icon-512.png`,
                    sizes: '512x512',
                    type: 'image/png',
                },
            ],
        };

        return NextResponse.json(manifest);
    } catch (error) {
        console.error('Manifest Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
