import connectDB from '@/lib/mongodb';
import { Tenant } from '@/models/Schemas';
import { ClienteMenu } from '@/models/ClienteMenu';

import { ThemeToggle } from '@/components/ThemeToggle';
import { MessageSquare } from 'lucide-react';
import { TenantHeader } from '@/components/TenantHeader';

interface TenantLayoutProps {
    children: React.ReactNode;
    params: Promise<{ tenantSlug: string }>;
}

function formatWhatsAppLink(url: string) {
    const numbers = url.replace("https://wa.me/", "").replace(/\D/g, "");
    const formatted = numbers.startsWith("55") ? numbers : `55${numbers}`;
    return `https://wa.me/+${formatted}`;
}

export default async function TenantLayout({ children, params }: TenantLayoutProps) {
    const { tenantSlug } = await params;
    await connectDB();
    const tenantRaw = await Tenant.findOne({ slug: tenantSlug }).lean();

    if (!tenantRaw || tenantRaw.active === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-zinc-950 px-4 transition-colors duration-300">
                <div className="text-center space-y-4">
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Ops! Cliente não encontrado</h1>
                    <p className="text-neutral-500 dark:text-zinc-500 font-medium">Este estabelecimento pode estar inativo ou o link está incorreto.</p>
                </div>
            </div>
        );
    }

    const tenant = JSON.parse(JSON.stringify(tenantRaw));
    const whatsappLimpo = tenant.whatsApp ? formatWhatsAppLink(tenant.whatsApp) : "#";
    const primaryColor = tenant.colorPrimary || "#059669";

    // Fetch Menu Items
    const menuItemsRaw = await ClienteMenu.find({ clienteId: tenantRaw._id, ativo: true }).sort({ createdAt: 1 }).lean();
    const menuItems = JSON.parse(JSON.stringify(menuItemsRaw));

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-zinc-950 transition-colors duration-500">
            {/* Modern Header Navigation */}
            <TenantHeader tenant={tenant} menuItems={menuItems} />

            {/* Top Bar / Theme Toggle */}
            <div className="fixed top-24 right-6 z-40">
                <ThemeToggle />
            </div>

            {children}

            {/* WhatsApp Floating Button */}
            <a
                href={whatsappLimpo}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-6 py-4 rounded-sm shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                style={{ backgroundColor: primaryColor, color: '#fff' }}
            >
                <MessageSquare size={20} className="transition-transform group-hover:rotate-12" />
                <span className="font-bold tracking-tight">Falar no WhatsApp</span>
            </a>
        </main>
    );
}
