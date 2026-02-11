'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function AdminBreadcrumbs() {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    return (
        <nav className="flex items-center space-x-2 text-sm text-slate-500 mb-6">
            <Link href="/admin/tenants" className="hover:text-orange-600 transition-colors flex items-center gap-1">
                <Home size={14} />
                <span>Home</span>
            </Link>
            
            {paths.map((path, index) => {
                const href = `/${paths.slice(0, index + 1).join('/')}`;
                const isLast = index === paths.length - 1;
                const label = path.charAt(0).toUpperCase() + path.slice(1);

                // Ignora o termo "admin" para não ficar repetitivo (Home > Admin > Tenants)
                if (path === 'admin') return null;

                return (
                    <div key={path} className="flex items-center space-x-2">
                        <ChevronRight size={14} className="text-slate-300" />
                        {isLast ? (
                            <span className="font-semibold text-slate-800">{label}</span>
                        ) : (
                            <Link href={href} className="hover:text-orange-600 transition-colors">
                                {label}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}