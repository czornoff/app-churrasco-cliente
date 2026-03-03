import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Cardapio } from '@/models/Cardapio';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 });

    // Check if user has access to this tenant
    if (session.user.role === 'TENANT_OWNER' && !session.user.tenantIds?.includes(tenantId)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const cardapio = await Cardapio.findOne({ tenantId }).lean();
    return NextResponse.json(cardapio || { items: [] });
}
