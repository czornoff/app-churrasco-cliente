import { getServerSession } from "next-auth"; // Busca a sessão no servidor
import { ReactNode } from "react";
import Link from "next/link";
import { Users, UserCircle, UserCog, LayoutDashboard, ChevronRight } from "lucide-react";
import { AdminBreadcrumbs } from "@/components/AdminBreadcrumbs";
import Image from "next/image";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await getServerSession(); // Pega nome, email e imagem do Google

    return (
        <div className="flex min-h-screen">
            {/* Sidebar Fixa */}
            <aside className="w-64 bg-slate-900 text-white p-6 hidden md:flex flex-col">
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-orange-500 flex items-center gap-2">
                        <span className="bg-orange-500 w-2 h-6 rounded-full"></span>
                        MandeBem
                    </h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Admin Panel</p>
                </div>

                <nav className="space-y-2 flex-1">
                    <p className="text-xs font-semibold text-slate-500 px-2 pb-2 uppercase">Menu Principal</p>
                    
                    <Link href="/admin/tenants" className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                            <Users size={18} />
                            <span>Gerenciar Clientes</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                    </Link>

                    <Link href="/admin/users" className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                            <UserCog size={18} />
                            <span>Gerenciar Usuários</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                    </Link>

                    {/* NOVO LINK: MEU PERFIL */}
                    <Link href="/admin/perfil" className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                            <UserCircle size={18} />
                            <span>Meu Perfil</span>
                        </div>
                        <ChevronRight size={14} className="text-slate-600 group-hover:text-white" />
                    </Link>
                </nav>

                {/* Footer da Sidebar com info rápida */}
                <div className="mt-auto pt-6 border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 text-center italic">
                        v1.0.4 - 2026
                    </p>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 bg-slate-50 flex flex-col">
                <header className="h-16 bg-white border-b flex items-center justify-between px-8">
                    <span className="font-medium text-slate-600 flex gap-2"><LayoutDashboard /> Painel de Controle</span>
                    <div className="flex items-center gap-6">
                        {/* Bloco do Usuário */}
                            {session?.user && (
                                <div className="flex items-center gap-3 border-r pr-6 border-slate-200">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold text-slate-800 leading-tight">
                                            {session.user.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 uppercase font-semibold">
                                            Administrador
                                        </p>
                                    </div>
                                    {session.user.image ? (
                                        <Image
                                            className="w-9 h-9 rounded-full ring-2 ring-orange-100 shadow-sm"
                                            src={session.user.image} 
                                            alt="Avatar" 
                                            width={100}
                                            height={100}
                                            priority
                                        />
                                    ) : (
                                        <UserCircle className="text-slate-400 w-9 h-9" />
                                    )}
                                </div>
                            )}
                        <LogoutButton />
                    </div>
                </header>
                <div className="p-8 flex-1">
                    <AdminBreadcrumbs />
                    {children}
                </div>
            </main>
        </div>
    );
}