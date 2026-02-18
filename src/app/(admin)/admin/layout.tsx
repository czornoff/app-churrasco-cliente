import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ReactNode } from "react";
import { LayoutDashboard, UserCircle } from "lucide-react";
import { AdminBreadcrumbs } from "@/components/AdminBreadcrumbs";
import Image from "next/image";
import { LogoutButton } from "@/components/LogoutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarContent } from "@/components/SidebarContent";
import { MobileNav } from "@/components/MobileNav";
import { TenantSelector } from "@/components/TenantSelector";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(authOptions);

    return (
        <div className="flex min-h-screen bg-neutral-50 dark:bg-zinc-950 transition-colors duration-300">
            {/* Aside Sidebar (Desktop Only - Sticky to avoid overlaps) */}
            <aside className="sticky top-0 h-screen w-72 hidden md:block z-50 border-r border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen flex flex-col relative overflow-x-hidden">
                {/* Fixed Header with Glassmorphism */}
                <header className="fixed top-0 right-0 z-40 left-0 md:left-72 h-16 md:h-20 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-zinc-800/50 flex items-center justify-between px-4 md:px-10 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        {/* Mobile Navigator (Strictly small screens) */}
                        <MobileNav />

                        {/* Breadcrumbs always visible */}
                        <AdminBreadcrumbs />
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        {/* Tenant Selector - para usuários com múltiplos acessos */}
                        {session?.user?.tenantIds && session.user.tenantIds.length > 1 && (
                            <>
                                <div className="h-6 w-px bg-neutral-200 dark:bg-zinc-800 mx-2"></div>
                                <TenantSelector 
                                    tenantIds={session.user.tenantIds} 
                                    currentTenantId={session.user.tenantId}
                                    role={session.user.role}
                                />
                            </>
                        )}

                        <div className="h-6 w-px bg-neutral-200 dark:bg-zinc-800 mx-2"></div>

                        {/* User Profile Summary */}
                        {session?.user && (
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden lg:block">
                                    <p className="text-xs font-black text-neutral-900 dark:text-white mb-0.5 tracking-tight truncate max-w-[150px]">
                                        {session.user.name}
                                    </p>
                                    <p className="text-[9px] text-neutral-400 dark:text-zinc-500 uppercase font-black tracking-widest">
                                        {session.user.role === 'SUPERADMIN' ? 'Administrador' : (session.user.role === 'TENANT_OWNER' ? 'Admin de Estabelecimento' : 'Usuário')}
                                    </p>
                                </div>
                                {session.user.image ? (
                                    <div className="relative w-8 h-8 md:w-10 md:h-10">
                                        <Image
                                            className="rounded-full ring-2 ring-neutral-100 dark:ring-zinc-800 shadow-sm object-cover"
                                            src={session.user.image}
                                            alt="Avatar"
                                            fill
                                            sizes="(max-width: 768px) 32px, 40px"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center border border-neutral-200 dark:border-zinc-700">
                                        <UserCircle className="text-neutral-400 dark:text-zinc-600 w-6 h-6" />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="ml-2">
                            <LogoutButton />
                        </div>
                    </div>
                </header>

                {/* Dashboard / Content Area - Added padding top to compensate for fixed header */}
                <div className="p-4 md:p-10 pt-20 md:pt-30 flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {children}
                </div>
            </main>
        </div>
    );
}