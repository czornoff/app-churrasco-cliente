'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
    UtensilsCrossed,
    Calculator,
    User as UserIcon,
    LogOut,
    ChevronDown,
    Menu,
    X,
    UserCircle,
    LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { EndUserAuthModal } from './auth/EndUserAuthModal';
import { PublicTenantSelector } from './PublicTenantSelector';
import { cn } from '@/lib/utils';

interface TenantHeaderProps {
    tenant: {
        _id: string;
        name: string;
        slug: string;
        logoUrl: string;
        colorPrimary: string;
    };
    menuItems?: {
        _id: string;
        nome: string;
        url: string;
        ativo: boolean;
    }[];
}

export function TenantHeader({ tenant, menuItems = [] }: TenantHeaderProps) {
    const { data: session } = useSession();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isInternalLink = (url: string) => url.startsWith('/') || !url.startsWith('http');

    // Hardcoded items
    const fixedItems = [
        { _id: 'fixed-calculadora', nome: 'Calculadora', url: '/calculadora', ativo: true },
        { _id: 'fixed-cardapio', nome: 'Cardápio', url: '/cardapio', ativo: true },
    ];

    // Merge logic: Add fixed items unless they conflict (optional, but requested to be fixed)
    // Actually, user said "calculadora e cardápio sempre devem estar visíveis... então não entram na configuração nova, devem ser fixas"
    // So we prepend them. We also filter out any dynamic menu item that tries to replicate them by name to avoid duplicates.
    const filteredDynamicItems = menuItems.filter(item =>
        !['calculadora', 'cardápio', 'cardapio'].includes(item.nome.toLowerCase())
    );

    const allMenuItems = [...fixedItems, ...filteredDynamicItems];

    return (
        <>
            <header className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6",
                scrolled
                    ? "py-3 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md shadow-lg border-b border-zinc-200 dark:border-zinc-800"
                    : "py-6 bg-transparent"
            )}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo & Brand */}
                    <Link href={`/${tenant.slug}`} className="flex items-center gap-3 active:scale-95 transition-transform">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm bg-white">
                            <Image
                                unoptimized
                                src={tenant.logoUrl}
                                alt={tenant.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className={cn(
                            "font-black uppercase tracking-tighter text-xl",
                            scrolled ? "text-zinc-900 dark:text-white" : "text-zinc-900 dark:text-white"
                        )}>
                            {tenant.name}
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1 bg-zinc-100/20 dark:bg-zinc-900/20 p-1 rounded-sm backdrop-blur-sm">
                        {allMenuItems.map((item) => {
                            const href = isInternalLink(item.url)
                                ? `/${tenant.slug}${item.url.startsWith('/') ? item.url : '/' + item.url}`
                                : item.url;

                            const Icon = item.nome.toLowerCase().includes('cardápio') ? UtensilsCrossed
                                : item.nome.toLowerCase().includes('calculadora') ? Calculator
                                    : Menu;

                            return (
                                <Link key={item._id} href={href} target={!isInternalLink(item.url) ? "_blank" : undefined}>
                                    <Button variant="ghost" className={cn(
                                        "rounded-sm px-4 font-bold text-xs uppercase tracking-widest transition-all",
                                        scrolled ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-600 dark:text-zinc-400"
                                    )}>
                                        <Icon size={14} className="mr-2" />
                                        {item.nome}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Auth & User Menu */}
                    <div className="flex items-center gap-4">
                        {session ? (
                            <>
                                {/* Public Tenant Selector - aparece apenas se múltiplos tenants */}
                                <PublicTenantSelector 
                                    currentTenantSlug={tenant.slug}
                                    colorPrimary={tenant.colorPrimary}
                                />
                                
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 group outline-none">
                                        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-md group-hover:scale-105 transition-all">
                                            <Image
                                                unoptimized
                                                src={session.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user?.name || 'U')}&background=random`}
                                                alt={session.user?.name || 'User'}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <ChevronDown size={14} className={cn(
                                            "transition-transform group-data-[state=open]:rotate-180",
                                            scrolled ? "text-zinc-500" : "text-white"
                                        )} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-sm p-2 border-none shadow-2xl bg-white dark:bg-zinc-950 animate-in zoom-in-95 duration-200">
                                    <DropdownMenuLabel className="px-3 py-2">
                                        <p className="text-xs uppercase font-black text-zinc-400 tracking-widest">Acesso Cliente</p>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{session.user?.name}</p>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-900" />
                                    <DropdownMenuItem className="rounded-sm font-bold text-zinc-600 dark:text-zinc-400 focus:bg-zinc-50 dark:focus:bg-zinc-900 cursor-pointer">
                                        <UserCircle size={16} className="mr-3" />
                                        Meu Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-sm font-bold text-zinc-600 dark:text-zinc-400 focus:bg-zinc-50 dark:focus:bg-zinc-900 cursor-pointer">
                                        <Calculator size={16} className="mr-3" />
                                        Meus Churrascos
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="my-1 bg-zinc-100 dark:bg-zinc-900" />
                                    <DropdownMenuItem
                                        className="rounded-sm font-bold text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 cursor-pointer"
                                        onClick={() => signOut()}
                                    >
                                        <LogOut size={16} className="mr-3" />
                                        Sair da Conta
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </>
                        ) : (
                            <Button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="rounded-sm px-6 h-10 font-black text-xs uppercase tracking-widest text-white shadow-xl hover:opacity-90 transition-all active:scale-95"
                                style={{ backgroundColor: tenant.colorPrimary }}
                            >
                                <LogIn size={16} className="mr-2" />
                                Entrar
                            </Button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 text-white"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} className={scrolled ? "text-zinc-900 dark:text-white" : "text-white"} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 p-6 animate-in slide-in-from-top duration-300">
                        <nav className="flex flex-col gap-4">
                            {allMenuItems.map((item) => {
                                const href = isInternalLink(item.url)
                                    ? `/${tenant.slug}${item.url.startsWith('/') ? item.url : '/' + item.url}`
                                    : item.url;

                                const Icon = item.nome.toLowerCase().includes('cardápio') ? UtensilsCrossed
                                    : item.nome.toLowerCase().includes('calculadora') ? Calculator
                                        : Menu;

                                return (
                                    <Link key={item._id} href={href} onClick={() => setIsMobileMenuOpen(false)} target={!isInternalLink(item.url) ? "_blank" : undefined}>
                                        <div className="p-4 rounded-sm bg-zinc-50 dark:bg-zinc-900 font-black text-xs uppercase tracking-widest flex items-center justify-between">
                                            {item.nome}
                                            <Icon size={16} style={{ color: tenant.colorPrimary }} />
                                        </div>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </header>

            <EndUserAuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                tenantId={tenant._id}
                tenantName={tenant.name}
                primaryColor={tenant.colorPrimary}
            />
        </>
    );
}
