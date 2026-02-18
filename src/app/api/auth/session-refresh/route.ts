import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from "@/lib/mongodb";
import { User } from '@/models/User';

/**
 * Endpoint para refrescar a sessão do usuário
 * Busca os dados mais recentes do banco e retorna uma sessão atualizada
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, message: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Buscar os dados mais recentes do banco
        await connectDB();
        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        // Retornar dados atualizados
        return NextResponse.json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.nome,
                email: user.email,
                image: user.avatar,
                role: user.role,
                status: user.status,
                tenantId: user.tenantId ? user.tenantId.toString() : null,
                tenantIds: user.tenantIds?.map(id => id.toString()) || []
            }
        });
    } catch (error) {
        console.error('Erro ao refrescar sessão:', error);
        return NextResponse.json(
            { success: false, message: 'Erro ao refrescar sessão' },
            { status: 500 }
        );
    }
}
