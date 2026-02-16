'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function AdminBreadcrumbs() {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    return (
        <nav className="flex items-center space-x-2 text-sm text-neutral-400 dark:text-zinc-500">
            <Link href="/admin" className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors flex items-center gap-1.5 group">
                <Home size={14} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Home</span>
            </Link>

            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`;
                const isLast = index === paths.length - 1;
                const label = path === 'tenants' ? 'Estabelecimentos' :
                    path === 'users' ? 'Usuários' :
                        path === 'perfil' ? 'Perfil' :
                            path.charAt(0).toUpperCase() + path.slice(1);

                // Ignora o termo "admin" para não ficar repetitivo (Home > Admin > Tenants)
                if (path === 'admin') return null;

                return (
                    <div key={path} className="flex items-center space-x-2">
                        <ChevronRight size={14} className="text-neutral-300 dark:text-zinc-800" />
                        {isLast ? (
                            <span className="font-bold text-neutral-900 dark:text-white">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors font-medium">
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}