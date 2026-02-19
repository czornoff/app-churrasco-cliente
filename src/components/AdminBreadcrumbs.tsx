'use client'

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { getBreadcrumbData } from "@/lib/actions/breadcrumb";

interface BreadcrumbItem {
    label: string;
    href: string;
    isLast: boolean;
    isId?: boolean;
}

export function AdminBreadcrumbs() {
    const pathname = usePathname();
    const [items, setItems] = useState<BreadcrumbItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const generateBreadcrumbs = async () => {
            let paths = pathname.split('/').filter(Boolean);
            
            // Remover 'admin' do início
            if (paths[0] === 'admin') {
                paths = paths.slice(1);
            }
            
            const breadcrumbs: BreadcrumbItem[] = [];

            // Regex para detectar ObjectIds do MongoDB
            const isObjectId = (str: string) => /^[a-f0-9]{24}$/.test(str);

            // Parse dos segmentos da URL
            let tenantId: string | undefined;

            for (let index = 0; index < paths.length; index++) {
                const path = paths[index];
                const nextPath = paths[index + 1];
                const isLast = index === paths.length - 1;

                // Detectar tenant ID (ObjectId que vem antes de 'produtos')
                if (isObjectId(path) && nextPath === 'produtos') {
                    tenantId = path;
                }

                // PARAR antes de produtos ou depois de produtos se houver um ID
                // Ou seja: nunca mostrar o ID do produto
                if (nextPath === 'produtos' || (path === 'produtos' && isObjectId(paths[index + 1]))) {
                    // Incluir até "produtos" mas não o ID do produto
                    if (path !== 'produtos' || !isObjectId(nextPath)) {
                        const href = `/admin/${paths.slice(0, index + 1).join('/')}`;
                        
                        let label = path;
                        if (path === 'tenants') label = 'Estabelecimentos';
                        else if (path === 'users') label = 'Usuários';
                        else if (path === 'perfil') label = 'Perfil';
                        else if (path === 'produtos') label = 'Produtos';
                        else if (path === 'register') label = 'Registrar';
                        else if (path === 'novo') label = 'Novo';
                        else if (isObjectId(path)) label = '...'; // Será atualizado depois

                        breadcrumbs.push({
                            label,
                            href,
                            isLast: path === 'produtos' || isLast,
                            isId: isObjectId(path)
                        });
                    }
                    
                    // Se é "produtos", incluir e parar
                    if (path === 'produtos') {
                        break;
                    }
                } else if (nextPath !== 'produtos') {
                    // Segmentos normais (não relacionados a produtos)
                    const href = `/admin/${paths.slice(0, index + 1).join('/')}`;
                    
                    let label = path;
                    if (path === 'tenants') label = 'Estabelecimentos';
                    else if (path === 'users') label = 'Usuários';
                    else if (path === 'perfil') label = 'Perfil';
                    else if (path === 'produtos') label = 'Produtos';
                    else if (path === 'register') label = 'Registrar';
                    else if (path === 'novo') label = 'Novo';
                    else if (isObjectId(path)) label = '...'; // Será atualizado depois

                    breadcrumbs.push({
                        label,
                        href,
                        isLast,
                        isId: isObjectId(path)
                    });
                }
            }

            // Buscar nomes reais para IDs
            if (tenantId) {
                const data = await getBreadcrumbData(tenantId);
                
                // Atualizar labels dos IDs
                breadcrumbs.forEach(item => {
                    if (item.isId && item.label === '...' && tenantId && item.href.includes(tenantId)) {
                        item.label = data.tenantName || 'Estabelecimento';
                    }
                });
            }

            setItems(breadcrumbs);
            setLoading(false);
        };

        generateBreadcrumbs();
    }, [pathname]);

    return (
        <nav className="flex items-center space-x-2 text-sm text-zinc-400 dark:text-zinc-500">
            <Link href="/admin" className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors flex items-center gap-1.5 group">
                <Home size={14} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">Home</span>
            </Link>

            {items.map((item, index) => (
                <div key={`${item.href}-${index}`} className="flex items-center space-x-2">
                    <ChevronRight size={14} className="text-zinc-300 dark:text-zinc-800" />
                    {item.isLast ? (
                        <span className="font-bold text-zinc-900 dark:text-white">{item.label}</span>
                    ) : (
                        <Link 
                            href={item.href} 
                            className="hover:text-orange-600 dark:hover:text-orange-500 transition-colors font-medium truncate max-w-xs"
                            title={item.label}
                        >
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}