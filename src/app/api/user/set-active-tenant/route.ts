import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { setActiveTenantAction } from '@/lib/actions/tenant-user';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: 'Não autenticado' },
                { status: 401 }
            );
        }

        const { tenantId } = await request.json();

        if (!tenantId) {
            return NextResponse.json(
                { success: false, message: 'tenantId é obrigatório' },
                { status: 400 }
            );
        }

        const result = await setActiveTenantAction(session.user.id, tenantId);
        
        return NextResponse.json(result);
    } catch (error) {
        console.error('Erro ao alterar tenant ativo:', error);
        return NextResponse.json(
            { success: false, message: 'Erro ao alterar estabelecimento ativo' },
            { status: 500 }
        );
    }
}
