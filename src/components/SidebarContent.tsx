'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserCircle, UserCog, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/tenants", label: "Estabelecimentos", icon: Users },
    { href: "/admin/users", label: "Usuários", icon: UserCog },
    { href: "/admin/perfil", label: "Meu Perfil", icon: UserCircle },
];

export function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
    const pathname = usePathname();
    const { data: session } = useSession();

    // Filtra itens baseado no role do usuário
    const visibleItems = navItems.filter(item => {
        // TENANT_OWNER só vê "Meu Perfil"
        if (session?.user?.role === 'TENANT_OWNER') {
            return item.label === 'Meu Perfil';
        }
        // Super admin vê todos os itens
        return true;
    });

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-8 border-b border-zinc-100 dark:border-zinc-800/50 mb-6">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-base font-black text-zinc-900 dark:text-white tracking-tighter leading-none">
                            MandeBem
                        </h2>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-bold tracking-widest mt-1">
                            Administração
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto pb-6">
                <div>
                    <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 px-4 mb-4 uppercase tracking-[0.2em]">
                        Menu Principal
                    </p>
                    <nav className="space-y-1">
                        {visibleItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onItemClick}
                                    className={cn(
                                        "flex items-center justify-between group px-4 py-3 rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                                            : "text-zinc-500 dark:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-300"
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
                        })}
                    </nav>
                </div>
            </div>

            {/* Version Footer */}
            <div className="p-6 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 text-center border border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-widest">
                        versão 2.1.0
                    </p>
                </div>
            </div>
        </div>
    );
}
