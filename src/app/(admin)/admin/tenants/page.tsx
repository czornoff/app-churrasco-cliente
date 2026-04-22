import { Users } from "lucide-react"
import connectDB from "@/lib/mongodb"
import { Tenant } from "@/models/Schemas"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TenantManager } from "@/components/admin/TenantManager";
import { GlobalBackupImport } from "@/components/admin/GlobalBackupImport";

// Configurações para garantir que a página reflita os dados do banco em tempo real
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminTenantsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // TENANT_OWNER vê apenas seus lojas
    const isTenantOwner = session?.user?.role === 'TENANT_OWNER';
    const filter = isTenantOwner && session.user.tenantIds
        ? { _id: { $in: session.user.tenantIds } }
        : {};

    await connectDB()
    const tenantsRaw = await Tenant.find(filter).sort({ active: -1 }).sort({ createdAt: -1 }).lean()

    // Serializa para o componente client
    const tenants = JSON.parse(JSON.stringify(tenantsRaw));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-left gap-2">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Lojas</h1>
                        <p className="text-zinc-500 dark:text-zinc-200 text-sm">
                            Cadastre e gerencie lojas que utilizam sua calculadora.
                        </p>
                    </div>
                </div>
                {session?.user?.role === 'SUPERADMIN' && (
                    <GlobalBackupImport />
                )}
            </div>

            <TenantManager initialTenants={tenants} isTenantOwner={isTenantOwner} />
        </div>
    )
}
