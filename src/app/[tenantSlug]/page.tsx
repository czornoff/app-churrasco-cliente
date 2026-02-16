import connectDB from '@/lib/mongodb';
import { Tenant } from '@/models/Schemas';
import Image from "next/image";
import Link from 'next/link';
import { ArrowRight, Instagram, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function TenantHome({ params }: { params: Promise<{ tenantSlug: string }> }) {
    const { tenantSlug } = await params;
    await connectDB();
    const tenantRaw = await Tenant.findOne({ slug: tenantSlug }).lean();

    if (!tenantRaw) {
        return null; // Should be handled by layout, but safe fallback
    }

    const tenant = JSON.parse(JSON.stringify(tenantRaw));
    const primaryColor = tenant.colorPrimary || "#059669";

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)]">
            {/* Hero Section / Banner */}
            <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-10 dark:opacity-20 blur-[120px] pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }}
                ></div>

                <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
                    <div className="relative mx-auto w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-full overflow-hidden border-4 border-white dark:border-zinc-900 shadow-2xl bg-white dark:bg-zinc-800 animate-in zoom-in duration-1000">
                        <Image
                            unoptimized
                            src={(tenant.logoUrl && tenant.logoUrl.trim()) || `https://ui-avatars.com/api/?name=${encodeURIComponent(tenant.name)}&background=random`}
                            alt={`Logo de ${tenant.name}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 128px, 192px"
                            priority
                        />
                    </div>

                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                        <h1 className="text-5xl md:text-7xl font-black text-neutral-900 dark:text-white tracking-tighter uppercase leading-tight">
                            {tenant.nomeApp || tenant.name}
                        </h1>
                        <p className="text-lg md:text-2xl text-neutral-500 dark:text-zinc-400 font-medium tracking-tight max-w-2xl mx-auto">
                            {tenant.slogan || "Sua melhor experiência em churrasco começa aqui."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                        <Link href={`/${tenant.slug}/calculadora`}>
                            <Button
                                size="lg"
                                className="rounded-full px-8 h-14 font-black text-sm uppercase tracking-widest shadow-xl hover:scale-105 transition-all w-full sm:w-auto"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Calcular Churrasco
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href={`/${tenant.slug}/cardapio`}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="rounded-full px-8 h-14 font-black text-sm uppercase tracking-widest border-2 hover:bg-neutral-100 dark:hover:bg-zinc-900 w-full sm:w-auto bg-transparent border-neutral-200 dark:border-zinc-800 text-neutral-900 dark:text-white"
                            >
                                Ver Cardápio
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Introductory Text Section */}
            <section className="px-6 py-16 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <div className="w-16 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto"></div>
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
                            Bem-vindo ao {tenant.name}
                        </h2>
                        <p className="text-lg text-neutral-600 dark:text-zinc-400 leading-relaxed">
                            {tenant.descricao || `Estamos felizes em ter você aqui! Utilizando nossa plataforma, você pode calcular a quantidade exata de ingredientes para o seu churrasco e navegar pelo nosso cardápio exclusivo. Oferecemos produtos de alta qualidade para garantir que seu evento seja inesquecível.`}
                        </p>
                    </div>
                </div>
            </section>

            {/* Spacer to push footer down if needed */}
            <div className="flex-grow"></div>

            {/* Simple Footer */}
            <footer className="py-12 px-6 border-t border-neutral-100 dark:border-zinc-900 mt-auto bg-neutral-50/50 dark:bg-zinc-950/50">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-neutral-200 dark:border-zinc-800 bg-white">
                            <Image
                                unoptimized
                                src={tenant.logoUrl}
                                alt={tenant.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="font-bold text-sm tracking-widest uppercase text-neutral-900 dark:text-white">
                            {tenant.name}
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8">
                        {tenant.instagram && (
                            <a
                                href={`https://instagram.com/${tenant.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-zinc-500 hover:text-pink-600 dark:hover:text-pink-500 transition-colors"
                            >
                                <Instagram size={18} />
                                <span className="hidden sm:inline">Instagram</span>
                            </a>
                        )}
                        {tenant.email && (
                            <a
                                href={`mailto:${tenant.email}`}
                                className="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-zinc-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                            >
                                <Mail size={18} />
                                <span className="hidden sm:inline">Contato</span>
                            </a>
                        )}
                        {tenant.address && (
                            <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-zinc-500 cursor-default">
                                <MapPin size={18} />
                                <span className="hidden sm:inline">{tenant.address}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-neutral-400 dark:text-zinc-600 font-medium">
                        © {new Date().getFullYear()} {tenant.name}. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}