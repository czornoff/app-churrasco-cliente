import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { Tenant } from "@/models/Schemas";
import { Users, Store, Activity, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
    await connectDB();

    // Busca métricas em paralelo para melhor performance
    const [userCount, tenantCount, activeTenants] = await Promise.all([
        User.countDocuments(),
        Tenant.countDocuments(),
        Tenant.countDocuments({ active: true })
    ]);

    const stats = [
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
            title: "Estabelecimentos",
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
            description: "Estabelecimentos operando agora",
            color: "text-orange-600 dark:text-orange-400",
            bg: "bg-orange-50 dark:bg-orange-500/10",
            link: "/admin/tenants"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end mb-6">
                <div className="flex items-left gap-2">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-200 text-sm">
                            Bem-vindo ao painel de controle do MandeBem.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="border border-neutral-200/50 dark:border-zinc-800/50 shadow-sm hover:shadow-xl hover:shadow-neutral-200/20 dark:hover:shadow-black/20 transition-all duration-300 rounded-3xl overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-[10px] font-black text-neutral-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2.5 rounded-2xl ${stat.bg} ${stat.color} transition-all group-hover:scale-110 group-hover:rotate-3 duration-500`}>
                                <stat.icon size={20} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-neutral-900 dark:text-white mb-1 tracking-tighter">{stat.value}</div>
                            <p className="text-xs text-neutral-400 dark:text-zinc-500 font-medium mb-6">
                                {stat.description}
                            </p>
                            <Link
                                href={stat.link}
                                className="flex items-center gap-2 text-xs font-black text-neutral-600 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors uppercase tracking-widest"
                            >
                                Ver detalhes
                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions or System Status */}
            <Card className="border-none shadow-2xl rounded-[2.5rem] dark:bg-zinc-100 text-zinc-900 overflow-hidden relative group dark:bg-zinc-900 dark:text-zinc-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-colors group-hover:bg-orange-500/20 duration-1000"></div>

                <div className="p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                    <div className="space-y-4 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 bg-zinc-800/20 dark:bg-white/10 px-4 py-1.5 rounded-full text-orange-700 dark:text-orange-400 text-xs font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                            <ShieldCheck size={16} />
                            <span>Sistema Seguro</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight max-w-xl">Gerencie suas unidades com facilidade</h2>
                        <p className="text-zinc-400 text-sm md:text-base max-w-md font-medium leading-relaxed">
                            Utilize o menu lateral para gerenciar usuários, visualizar estabelecimentos ou editar as configurações do seu perfil administrativo.
                        </p>
                    </div>
                    <div className="flex shrink-0">
                        <Link href="/admin/tenants">
                            <Button className="bg-orange-500 hover:bg-orange-300 text-neutral-950 font-black text-white px-10 py-8 rounded-2xl text-base transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
                                Novo Estabelecimento
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}