'use client';

import { ITenant } from '@/interfaces/tenant';
import { IClienteMenu } from '@/interfaces/menu';
import { Mail, Instagram } from 'lucide-react';
import Link from 'next/link';

interface TenantFooterProps {
    tenant: ITenant;
    menuItems?: IClienteMenu[];
}

export function TenantFooter({ tenant, menuItems = [] }: TenantFooterProps) {
    const currentYear = new Date().getFullYear();
    const primaryColor = tenant.colorPrimary || '#e53935';

    // Separar menus por categoria (usando idPai)
    const mainMenuItems = menuItems.filter(item => item.idPai === 0 || !item.idPai);
    
    // Limpar URLs de Instagram
    const instagramUrl = tenant.instagram ? 
        (tenant.instagram.startsWith('http') ? tenant.instagram : `https://instagram.com/${tenant.instagram}`) 
        : '';

    return (
        <footer className="w-full bg-zinc-950 dark:bg-black text-zinc-50 mt-8">
            {/* Linha decorativa de cor primária */}
            <div 
                className="h-1 w-full" 
                style={{ backgroundColor: primaryColor }}
            />

            {/* Conteúdo Principal */}
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
                
                {/* Seção Esquerda - Sobre */}
                <div className="space-y-4">
                    <h3 
                        className="text-lg font-black tracking-tight"
                        style={{ color: primaryColor }}
                    >
                        {tenant.nomeApp?.toUpperCase() || 'APLICAÇÃO'}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        {tenant.slogan || 'A solução inteligente para organizar seu evento.'}
                    </p>
                    <Link
                        href={`/${tenant.slug}/politica-privacidade`}
                        className="inline-block text-xs text-zinc-400 hover:text-white transition-colors duration-200 mt-2"
                    >
                        Política de Privacidade
                    </Link>
                </div>

                {/* Seção Central - Links Úteis */}
                <div className="space-y-4">
                    <h3 
                        className="text-sm font-bold tracking-widest uppercase"
                        style={{ color: primaryColor }}
                    >
                        Links Úteis
                    </h3>
                    <nav className="space-y-2">
                        {/* Menus fixos */}
                        <Link href={`/${tenant.slug}/calculadora`} className="block text-sm text-zinc-400 hover:text-white transition-colors duration-200">
                            Calculadora
                        </Link>
                        <Link href={`/${tenant.slug}/cardapio`} className="block text-sm text-zinc-400 hover:text-white transition-colors duration-200">
                            Cardápio
                        </Link>
                        
                        {/* Menus dinâmicos */}
                        {mainMenuItems.length > 0 && (
                            mainMenuItems.map((item) => (
                                <Link
                                    key={item._id}
                                    href={item.url}
                                    target={item.url.startsWith('http') ? '_blank' : undefined}
                                    rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="block text-sm text-zinc-400 hover:text-white transition-colors duration-200"
                                >
                                    {item.nome}
                                </Link>
                            ))
                        )}
                    </nav>
                </div>

                {/* Seção Direita - Contato */}
                <div className="space-y-4">
                    <h3 
                        className="text-sm font-bold tracking-widest uppercase"
                        style={{ color: primaryColor }}
                    >
                        Contato
                    </h3>
                    <div className="space-y-3">
                        {tenant.email && (
                            <a
                                href={`mailto:${tenant.email}`}
                                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                            >
                                <Mail size={16} className="transition-transform group-hover:scale-110" />
                                <span>{tenant.email}</span>
                            </a>
                        )}
                        {instagramUrl && (
                            <a
                                href={instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors duration-200 group"
                            >
                                <Instagram size={16} className="transition-transform group-hover:scale-110" />
                                <span>Instagram</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 py-6 text-center text-xs text-zinc-500">
                    © {currentYear} {tenant.name} - Desenvolvido por{' '}
                    <a
                        href="https://zornoff.com.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors duration-200"
                        style={{ color: primaryColor }}
                    >
                        Zornoff
                    </a>
                </div>
            </div>
        </footer>
    );
}
