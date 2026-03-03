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
                        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                            Histórico Geral de Cálculos
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-200 text-sm">
                            Visualize todos os cálculos realizados em todos os estabelecimentos.
                        </p>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
                    <ClientAdminGeneralCalculations initialCalculations={JSON.parse(JSON.stringify(calculations))} />
                </div>
            </div>
        </div>
    );
}
