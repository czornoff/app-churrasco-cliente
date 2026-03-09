'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserCog, LayoutDashboard, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/tenants", label: "Lojas", icon: Users },
    { href: "/admin/users", label: "Usuários", icon: UserCog },
    { href: "/admin/calculations", label: "Histórico", icon: History }
];

export function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Filtra itens baseado no role do usuário (sempre retorna true por padrão para evitar lista vazia enquanto carrega)
    const visibleItems = navItems.filter(item => {
        if (!session) return true; // Mostra tudo enquanto carrega

        const role = session?.user?.role;

        // Regras de visibilidade por role
        if (role === 'TENANT_OWNER') {
            // Tenant Owner não vê Dashboard (é redirecionado) mas vê Usuários filtrados
            const allowedForOwner = ["/admin/tenants", "/admin/users", "/admin/calculations", "/admin/perfil"];
            return allowedForOwner.includes(item.href);
        }

        if (role === 'SUPERADMIN') {
            return true;
        }

        // Outros roles (ex: END_USER que cair aqui por erro) veem apenas perfil
        return item.href === "/admin/perfil";
    });

    const isMobile = !!onItemClick;

    return (
        <div className={cn(
            "flex flex-col h-full w-full bg-white dark:bg-zinc-900",
            !isMobile && "border-r border-zinc-200 dark:border-zinc-800"
        )}>
            {/* Logo Area */}
            <div className="h-20 flex items-center px-8 border-b border-zinc-100 dark:border-zinc-800/50 mb-6 shrink-0 relative gap-3">
                <div className="">
                    <img
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/icon-512.png`}
                        alt="Logo"
                        className="w-9 h-9 object-cover"
                    />
                </div>
                <div>
                    <h2 className="text-base font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
                        MandeBem
                    </h2>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-widest mt-1">
                        Administração
                    </p>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto pb-6">
                <div className="mt-4 md:mt-0">
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 px-4 mb-4 uppercase tracking-[0.2em]">
                        Menu Principal
                    </p>
                    <nav className="space-y-1">
                        {visibleItems.length > 0 ? visibleItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onItemClick}
                                    className={cn(
                                        "flex items-center justify-between group px-4 py-3 rounded-lg transition-all duration-200",
                                        isActive
                                            ? "bg-zinc-100 dark:bg-zinc-800 text-orange-600 dark:text-orange-500 shadow-sm"
                                            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} className={cn(
                                            "transition-colors duration-200",
                                            isActive ? "text-orange-600" : "text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400"
                                        )} />
                                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                                    </div>
                                    {isActive && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-600 shadow-[0_0_8px_rgba(234,88,12,0.4)]"></div>
                                    )}
                                </Link>
                            );
                        }) : (
                            <div className="p-4 text-xs text-zinc-500">Carregando menu...</div>
                        )}
                    </nav>
                </div>
            </div>

            {/* Version Footer - Optional on Mobile */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/50 shrink-0">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 text-center border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">
                        versão 2.1.1
                    </p>
                </div>
            </div>
        </div>
    );
}
