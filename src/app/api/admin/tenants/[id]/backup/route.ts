import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Tenant, Calculation, Category } from '@/models/Schemas';
import { ClienteMenu } from '@/models/ClienteMenu';
import { ClientePagina } from '@/models/ClientePagina';
import { Cardapio } from '@/models/Cardapio';
import { User } from '@/models/User';
import { WhatsAppLog } from '@/models/WhatsAppLog';
import CryptoJS from 'crypto-js';

const BACKUP_SECRET = process.env.BACKUP_SECRET || 'mandebem-backup-secret-key-2024';
const BACKUP_VERSION = '1.0';

function encryptData(data: object): string {
    const json = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(json, BACKUP_SECRET).toString();
    return encrypted;
}

function decryptData(encrypted: string): object {
    const bytes = CryptoJS.AES.decrypt(encrypted, BACKUP_SECRET);
    const json = bytes.toString(CryptoJS.enc.Utf8);
    if (!json) throw new Error('Falha ao descriptografar: chave incorreta ou arquivo corrompido.');
    return JSON.parse(json);
}

// GET /api/admin/tenants/[id]/backup — Exportar loja
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPERADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { id } = await params;

    try {
        await connectDB();

        // Coleta todos os dados vinculados ao tenant
        const [tenant, cardapio, categories, users, calculations, whatsappLogs, menus, paginas] = await Promise.all([
            Tenant.findById(id).lean(),
            Cardapio.findOne({ tenantId: id }).lean(),
            Category.find({ tenantId: id }).lean(),
            User.find({
                $or: [
                    { tenantId: id },
                    { tenantIds: id }
                ]
            }).lean(),
            Calculation.find({ tenantId: id }).lean(),
            WhatsAppLog.find({ tenantId: id }).lean(),
            ClienteMenu.find({ tenantId: id }).lean(),
            ClientePagina.findOne({ tenantId: id }).lean(),
        ]);

        if (!tenant) {
            return NextResponse.json({ error: 'Loja não encontrada.' }, { status: 404 });
        }

        const backupPayload = {
            version: BACKUP_VERSION,
            exportedAt: new Date().toISOString(),
            tenantId: id,
            data: {
                tenant,
                cardapio,
                categories,
                users,
                calculations,
                whatsappLogs,
                menus,
                paginas,
            },
            summary: {
                totalCategories: categories.length,
                totalUsers: users.length,
                totalCalculations: calculations.length,
                totalWhatsAppLogs: whatsappLogs.length,
                totalMenus: menus.length,
                hasPaginas: !!paginas,
                totalCardapioItems: cardapio
                    ? (
                        (cardapio.carnes?.length || 0) +
                        (cardapio.bebidas?.length || 0) +
                        (cardapio.acompanhamentos?.length || 0) +
                        (cardapio.outros?.length || 0) +
                        (cardapio.sobremesas?.length || 0) +
                        (cardapio.suprimentos?.length || 0)
                    )
                    : 0,
            }
        };

        const encrypted = encryptData(backupPayload);

        return new NextResponse(encrypted, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="backup-${(tenant as any).slug || id}-${new Date().toISOString().split('T')[0]}.mbkp"`,
            },
        });

    } catch (error) {
        console.error('[BACKUP_EXPORT_ERROR]', error);
        return NextResponse.json({ error: 'Erro ao gerar backup.' }, { status: 500 });
    }
}

// POST /api/admin/tenants/[id]/backup — Importar loja
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'SUPERADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const { id } = await params;

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

        const { tenant, cardapio, categories, users, calculations, whatsappLogs, menus, paginas } = backup.data;

        // Restaurar Tenant (sobrescreve o atual pelo ID da URL, não pelo ID do backup)
        const { _id: _tenantId, __v, createdAt, updatedAt, ...tenantData } = tenant;
        await Tenant.findByIdAndUpdate(id, tenantData, { upsert: false, new: true });

        // Restaurar Cardápio
        let cardapioRestored = 0;
        if (cardapio) {
            const { _id: _cid, __v: _cv, ...cardapioData } = cardapio;
            await Cardapio.findOneAndUpdate(
                { tenantId: id },
                { ...cardapioData, tenantId: id },
                { upsert: true, new: true }
            );
            cardapioRestored = 1;
        }

        // Restaurar Categorias (apaga as atuais e re-insere do backup)
        let categoriesRestored = 0;
        if (categories && categories.length > 0) {
            await Category.deleteMany({ tenantId: id });
            const categoriesWithTenant = categories.map(({ _id, __v, ...cat }: any) => ({
                ...cat,
                tenantId: id,
            }));
            await Category.insertMany(categoriesWithTenant);
            categoriesRestored = categoriesWithTenant.length;
        }

        // Restaurar Cálculos (upsert por _id original)
        let calculationsRestored = 0;
        if (calculations && calculations.length > 0) {
            for (const calc of calculations) {
                const { _id, __v, ...calcData } = calc;
                await Calculation.findByIdAndUpdate(
                    _id,
                    { ...calcData, tenantId: id },
                    { upsert: true, new: true }
                );
            }
            calculationsRestored = calculations.length;
        }

        // Restaurar Menus (apaga os atuais e re-insere do backup)
        let menusRestored = 0;
        if (menus && menus.length > 0) {
            await ClienteMenu.deleteMany({ tenantId: id });
            const menusWithTenant = menus.map(({ _id, __v, ...menu }: any) => ({
                ...menu,
                tenantId: id,
            }));
            await ClienteMenu.insertMany(menusWithTenant);
            menusRestored = menusWithTenant.length;
        }

        // Restaurar Paginas
        let paginasRestored = 0;
        if (paginas) {
            const { _id, __v, ...paginasData } = paginas;
            await ClientePagina.findOneAndUpdate(
                { tenantId: id },
                { ...paginasData, tenantId: id },
                { upsert: true, new: true }
            );
            paginasRestored = 1;
        }

        // Nota: Usuários e WhatsAppLogs NÃO são sobrescritos automaticamente
        // para evitar conflitos de email único e logs duplicados.
        // Retorna contagem para transparência.

        return NextResponse.json({
            success: true,
            message: 'Backup restaurado com sucesso.',
            restored: {
                tenant: 1,
                cardapio: cardapioRestored,
                categories: categoriesRestored,
                calculations: calculationsRestored,
                menus: menusRestored,
                paginas: paginasRestored,
                users: users?.length || 0,
                whatsappLogs: whatsappLogs?.length || 0,
                note: 'Usuários e logs do WhatsApp não foram sobrescritos (prevenção de conflitos).',
            }
        });

    } catch (error) {
        console.error('[BACKUP_IMPORT_ERROR]', error);
        return NextResponse.json({ error: 'Erro ao restaurar backup.' }, { status: 500 });
    }
}
