import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar Fixa */}
            <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
                <h2 className="text-xl font-bold mb-8">MandeBem Admin</h2>
                <nav className="space-y-4">
                    <Link href="/admin/tenants" className="block hover:text-orange-400 transition-colors">
                        Gerenciar Clientes
                    </Link>
                </nav>
            </aside>

            {/* Conteúdo Principal */}
            <main className="flex-1 bg-slate-50">
                <header className="h-16 bg-white border-b flex items-center justify-between px-8">
                    <span className="font-medium text-slate-600">Painel de Controle</span>
                    <Button variant="outline" size="sm">Sair</Button>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}