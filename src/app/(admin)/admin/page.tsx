import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { Tenant } from "@/models/Schemas";
import { Users, Store, Activity, ArrowRight, ShieldCheck, Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ResetModelButton } from "@/components/admin/ResetModelButton";
import { DashboardMetrics } from "@/components/admin/DashboardMetrics";
import { getDashboardStatsAction } from "@/lib/actions/dashboard-stats";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    // Se não houver sessão, redirecionar para login
    if (!session?.user) {
        redirect('/login');
    }

    // Se role não está definido no banco, redirecionar para login para refazer
    if (!session.user.role) {
        redirect('/login');
    }

    // Redirecionar END_USER - não pode acessar admin
    if (session.user.role === 'END_USER') {
        redirect('/');
    }

    // Verificar roles permitidos
    const isSuperAdmin = session.user.role === 'SUPERADMIN';
    const isTenantOwner = session.user.role === 'TENANT_OWNER';

    if (!isSuperAdmin && !isTenantOwner) {
        redirect('/');
    }

    await connectDB();

    // Determinar tenantIds para filtro (vazio = global para SUPERADMIN)
    const tenantIds = isTenantOwner && session.user.tenantIds
        ? (session.user.tenantIds as string[])
        : undefined;

    // Buscar métricas por período
    const dashboardStats = await getDashboardStatsAction(tenantIds);

    // Métricas globais (somente para SUPERADMIN)
    let globalStats: { title: string; value: number; icon: any; description: string; color: string; bg: string; link: string }[] = [];

    if (isSuperAdmin) {
        const [userCount, tenantCount, activeTenants] = await Promise.all([
            User.countDocuments(),
            Tenant.countDocuments(),
            Tenant.countDocuments({ active: true })
        ]);

        globalStats = [
            {
                title: "Total de Usuários",
                value: userCount,
                icon: Users,
                description: "Usuários cadastrados no sistema",
                color: "text-blue-600 dark:text-blue-400",
                bg: "bg-blue-50 dark:bg-blue-500/10",
                link: "/admin/users"
            },
            {
                title: "Lojas",
                value: tenantCount,
                icon: Store,
                description: "Total de lojas e restaurantes",
                color: "text-orange-600 dark:text-orange-400",
                bg: "bg-orange-50 dark:bg-orange-500/10",
                link: "/admin/tenants"
            },
            {
                title: "Unidades Ativas",
                value: activeTenants,
                icon: Activity,
                description: "Lojas operando agora",
                color: "text-orange-600 dark:text-orange-400",
                bg: "bg-orange-50 dark:bg-orange-500/10",
                link: "/admin/tenants"
            }
        ];
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-left gap-2">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">Dashboard</h1>
                        <p className="text-zinc-500 dark:text-zinc-200 text-sm">
                            {isSuperAdmin
                                ? 'Bem-vindo ao painel de controle do MandeBem.'
                                : 'Visão geral da sua loja.'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Métricas por Período */}
                <DashboardMetrics stats={dashboardStats} />

                {/* Cards Globais — somente SUPERADMIN */}
                {isSuperAdmin && globalStats.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {globalStats.map((stat, index) => (
                            <Card key={index} className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg overflow-hidden group">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                                        {stat.title}
                                    </CardTitle>
                                    <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} transition-all group-hover:scale-110 group-hover:rotate-3 duration-500`}>
                                        <stat.icon size={20} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-black text-zinc-900 dark:text-white mb-1 tracking-tighter">{stat.value}</div>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium mb-6">
                                        {stat.description}
                                    </p>
                                    <Link
                                        href={stat.link}
                                        className="flex items-center gap-2 text-xs font-black text-zinc-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase tracking-widest"
                                    >
                                        Ver detalhes
                                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Quick Actions or System Status — somente SUPERADMIN */}
                {isSuperAdmin && (
                    <Card className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg text-zinc-900 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-orange-500/20 duration-1000"></div>

                        <div className="p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                            <div className="space-y-4 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-zinc-800/20 dark:bg-white/10 px-4 py-1.5 rounded-full text-orange-700 dark:text-orange-400 text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                                    <ShieldCheck size={16} />
                                    <span>Sistema Seguro</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight max-w-xl">Gerencie suas unidades com facilidade</h2>
                                <p className="text-zinc-400 text-sm md:text-base max-w-md font-medium leading-relaxed">
                                    Utilize o menu lateral para gerenciar usuários, visualizar lojas ou editar as configurações do seu perfil administrativo.
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-3">
                                <Link href="/admin/tenants">
                                    <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4">
                                        <Plus size={18} />
                                        Nova Loja
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                )}

                {/* CTA para TENANT_OWNER */}
                {isTenantOwner && (
                    <Card className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg text-zinc-900 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-orange-500/20 duration-1000"></div>

                        <div className="p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                            <div className="space-y-4 text-center md:text-left">
                                <div className="inline-flex items-center gap-2 bg-zinc-800/20 dark:bg-white/10 px-4 py-1.5 rounded-full text-orange-700 dark:text-orange-400 text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                                    <Store size={16} />
                                    <span>Minha Loja</span>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight max-w-xl dark:text-white">Acompanhe o desempenho da sua loja</h2>
                                <p className="text-zinc-400 text-sm md:text-base max-w-md font-medium leading-relaxed">
                                    Visualize as métricas da sua loja, gerencie produtos e acompanhe os cálculos realizados pelos seus clientes.
                                </p>
                            </div>
                            <div className="flex shrink-0 gap-3">
                                <Link href="/admin/tenants">
                                    <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4">
                                        <Store size={18} className="mr-2" />
                                        Gerenciar Lojas
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}