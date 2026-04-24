import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Tenant, Calculation, Category } from '@/models/Schemas';
import { ClienteMenu } from '@/models/ClienteMenu';
import { ClientePagina } from '@/models/ClientePagina';
import { Cardapio } from '@/models/Cardapio';
import * as CryptoJS from 'crypto-js';

const BACKUP_SECRET = process.env.BACKUP_SECRET || 'mandebem-backup-secret-key-2024';

function decryptData(encrypted: string): object {
    const bytes = CryptoJS.AES.decrypt(encrypted, BACKUP_SECRET);
    const json = bytes.toString(CryptoJS.enc.Utf8);
    if (!json) throw new Error('Falha ao descriptografar: chave incorreta ou arquivo corrompido.');
    return JSON.parse(json);
}

// POST /api/admin/backup/import — Importar loja de forma global
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPERADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    try {
        const encryptedText = await req.text();
        if (!encryptedText) {
            return NextResponse.json({ error: 'Arquivo vazio ou inválido.' }, { status: 400 });
        }

        let backup: any;
        try {
            backup = decryptData(encryptedText);
        } catch {
            return NextResponse.json(
                { error: 'Arquivo corrompido ou chave de criptografia incompatível.' },
                { status: 400 }
            );
        }

        // Validação básica da estrutura
        if (!backup.version || !backup.data || !backup.data.tenant) {
            return NextResponse.json({ error: 'Estrutura de backup inválida.' }, { status: 400 });
        }

        await connectDB();

        const { tenant, cardapio, categories, calculations, menus, paginas } = backup.data;

        const { _id, __v, createdAt, updatedAt, slug, ...tenantData } = tenant;

        // Verifica se o slug original já existe para evitar conflito
        let finalSlug = slug;
        let slugExists = await Tenant.findOne({ slug: finalSlug });
        let counter = 1;
        while (slugExists) {
            finalSlug = `${slug}-${counter}`;
            slugExists = await Tenant.findOne({ slug: finalSlug });
            counter++;
        }

        // 1. Criar novo Tenant
        const newTenant = await Tenant.create({
            ...tenantData,
            slug: finalSlug,
            active: tenantData.active ?? true, // Garante que a loja venha ativa ou com o status salvo
        });

        const newTenantId = newTenant._id;

        // 2. Restaurar Cardápio (atribuído ao novo Tenant ID)
        let cardapioRestored = 0;
        if (cardapio) {
            const { _id: _cid, __v: _cv, tenantId: _tid, ...cardapioData } = cardapio;
            await Cardapio.create({
                ...cardapioData,
                tenantId: newTenantId,
            });
            cardapioRestored = 1;
        }

        // 3. Restaurar Categorias
        let categoriesRestored = 0;
        if (categories && categories.length > 0) {
            const categoriesWithNewTenant = categories.map(({ _id, __v, tenantId, ...cat }: any) => ({
                ...cat,
                tenantId: newTenantId,
            }));
            await Category.insertMany(categoriesWithNewTenant);
            categoriesRestored = categoriesWithNewTenant.length;
        }

        // 4. Restaurar Cálculos (neste caso, é global, então criamos novos IDs para evitar conflitos se o DB ainda tiver os antigos, ou mantemos os dados mas com novo ID)
        let calculationsRestored = 0;
        if (calculations && calculations.length > 0) {
            const calcsWithNewTenant = calculations.map(({ _id, __v, tenantId, ...calcData }: any) => ({
                ...calcData,
                tenantId: newTenantId,
            }));
            await Calculation.insertMany(calcsWithNewTenant);
            calculationsRestored = calcsWithNewTenant.length;
        }

        // 5. Restaurar Menus
        let menusRestored = 0;
        if (menus && menus.length > 0) {
            const menusWithNewTenant = menus.map(({ _id, __v, tenantId, ...menu }: any) => ({
                ...menu,
                tenantId: newTenantId,
            }));
            await ClienteMenu.insertMany(menusWithNewTenant);
            menusRestored = menusWithNewTenant.length;
        }

        // 6. Restaurar Páginas
        let paginasRestored = 0;
        if (paginas) {
            const { _id: _pid, __v: _pv, tenantId: _tid, ...paginasData } = paginas;
            await ClientePagina.create({
                ...paginasData,
                tenantId: newTenantId,
            });
            paginasRestored = 1;
        }

        return NextResponse.json({
            success: true,
            message: 'Loja importada com sucesso.',
            restored: {
                tenant: 1,
                cardapio: cardapioRestored,
                categories: categoriesRestored,
                calculations: calculationsRestored,
                menus: menusRestored,
                paginas: paginasRestored,
                note: `Loja recriada com sucesso (Slug: ${finalSlug}). Usuários e logs de WhatsApp não foram recriados para evitar conflitos no banco.`,
            }
        });

    } catch (error) {
        console.error('[GLOBAL_BACKUP_IMPORT_ERROR]', error);
        return NextResponse.json({ error: 'Erro ao importar loja.' }, { status: 500 });
    }
}
