import connectDB from "@/lib/mongodb";
import { Calculation, Tenant } from "@/models/Schemas";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { History } from "lucide-react";
import { ClientAdminGeneralCalculations } from "./ClientAdminGeneralCalculations";

export default async function GeneralCalculationsPage() {
    const session = await getServerSession(authOptions);

    const isSuperAdmin = session?.user?.role === 'SUPERADMIN';
    const isTenantOwner = session?.user?.role === 'TENANT_OWNER';

    if (!session || (!isSuperAdmin && !isTenantOwner)) {
        redirect("/admin");
    }

    await connectDB();

    const calcFilter = isTenantOwner && session.user.tenantIds
        ? { tenantId: { $in: session.user.tenantIds } }
        : {};

    const calculations = await Calculation.find(calcFilter)
        .sort({ createdAt: -1 })
        .limit(100)
        .populate({ path: 'tenantId', select: 'name slug', model: Tenant })
        .populate({ path: 'userId', select: 'nome email', model: User })
        .lean();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-left gap-2">
                    <History className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
                            Histórico Geral de Cálculos
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium">
                            Visualize todos os cálculos realizados em todos os estabelecimentos.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-2 overflow-hidden">
                <ClientAdminGeneralCalculations initialCalculations={JSON.parse(JSON.stringify(calculations))} />
            </div>
        </div>
    );
}
