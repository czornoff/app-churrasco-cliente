import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Tenant, Calculation } from '@/models/Schemas';
import { Cardapio } from '@/models/Cardapio';
import { ClienteMenu } from '@/models/ClienteMenu';
import { ClientePagina } from '@/models/ClientePagina';
import { User } from '@/models/User';
import { Types } from 'mongoose';
import fs from 'fs';
import path from 'path';

const LOJA_MODELO_ID = "69aa231d05b42a8c0ac4576d";

const transformData = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(transformData);
    }
    if (data !== null && typeof data === 'object') {
        if (data.$oid) {
            return new Types.ObjectId(data.$oid);
        }
        if (data.$date) {
            return new Date(data.$date);
        }
        const transformed: any = {};
        for (const key in data) {
            transformed[key] = transformData(data[key]);
        }
        return transformed;
    }
    return data;
};

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'SUPERADMIN') {
            return NextResponse.json({ error: 'Não autorizado. Apenas SUPERADMIN pode resetar a loja modelo.' }, { status: 401 });
        }

        await connectDB();

        const tenantObjectId = new Types.ObjectId(LOJA_MODELO_ID);

        // 1. Deletar dados existentes
        await Promise.all([
            Tenant.deleteMany({ _id: tenantObjectId }),
            Cardapio.deleteMany({ tenantId: tenantObjectId }),
            ClienteMenu.deleteMany({ tenantId: tenantObjectId }),
            ClientePagina.deleteMany({ tenantId: tenantObjectId }),
            Calculation.deleteMany({ tenantId: tenantObjectId }),
            // Para usuários, deletamos apenas se estiverem vinculados a este tenant e não forem superadmins
            User.deleteMany({ tenantId: tenantObjectId, role: { $ne: 'SUPERADMIN' } })
        ]);

        // 2. Ler e Inserir Seeds
        const seedsDir = path.join(process.cwd(), 'src', 'seeds');

        const seedFiles = [
            { file: 'clientes-db.tenants.json', model: Tenant },
            { file: 'clientes-db.cardapios.json', model: Cardapio },
            { file: 'clientes-db.clientemenus.json', model: ClienteMenu },
            { file: 'clientes-db.clientepaginas.json', model: ClientePagina },
            { file: 'clientes-db.calculations.json', model: Calculation },
            { file: 'clientes-db.users.json', model: User }
        ];

        for (const seed of seedFiles) {
            const filePath = path.join(seedsDir, seed.file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                let data = JSON.parse(content);
                data = transformData(data);

                if (Array.isArray(data)) {
                    // Se for Usuário, filtramos para não duplicar se já existir por email (caso de SUPERADMINs no seed)
                    if (seed.model === User) {
                        for (const user of data) {
                            await User.findOneAndUpdate(
                                { email: user.email },
                                user,
                                { upsert: true, new: true }
                            );
                        }
                    } else {
                        // Cast to any to avoid union type callable error
                        await (seed.model as any).insertMany(data);
                    }
                } else {
                    await seed.model.create(data);
                }
            }
        }

        return NextResponse.json({ message: 'Loja Modelo resetada com sucesso!' });
    } catch (error: any) {
        console.error('Erro ao resetar seeds:', error);
        return NextResponse.json({ error: 'Erro interno: ' + error.message }, { status: 500 });
    }
}
