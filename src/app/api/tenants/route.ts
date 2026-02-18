import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Tenant } from '@/models/Schemas';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids');

        if (!ids) {
            return NextResponse.json({ tenants: [] });
        }

        const tenantIds = ids.split(',');
        const tenants = await Tenant.find({ _id: { $in: tenantIds } }).lean();

        return NextResponse.json({ tenants });
    } catch (error) {
        console.error('Erro ao buscar tenants:', error);
        return NextResponse.json({ error: 'Erro ao buscar estabelecimentos' }, { status: 500 });
    }
}
