import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { ClientePagina } from "@/models/ClientePagina";
import type { IPagina, ICard } from "@/models/ClientePagina";
import { Tenant } from "@/models/Schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Metadata } from "next";

interface PageProps {
    params: Promise<{
        tenantSlug: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { tenantSlug, slug } = await params;
    await connectDB();

    const tenant = await Tenant.findOne({ slug: tenantSlug, active: true }).select("_id name");
    if (!tenant) return { title: "Página não encontrada" };

    const clientePagina = await ClientePagina.findOne({
        clienteId: tenant._id,
        "paginas.slug": slug,
        "paginas.ativo": true
    }).select("paginas.$");

    const page = clientePagina?.paginas[0];

    if (!page) return { title: "Página não encontrada" };

    const emoji = page.emoji ? `${page.emoji} ` : "";
    return {
        title: `${emoji}${page.titulo} | ${tenant.name}`,
        description: typeof page.texto === 'string' ? page.texto.substring(0, 160) : 'Página de conteúdo'
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { tenantSlug, slug } = await params;
    await connectDB();

    const tenantRaw = await Tenant.findOne({ slug: tenantSlug, active: true });

    if (!tenantRaw) {
        notFound();
    }

    const tenant = JSON.parse(JSON.stringify(tenantRaw));
    const primaryColor = tenant.colorPrimary || "#059669";

    // Format WhatsApp link
    function formatWhatsAppLink(url: string) {
        const numbers = url.replace("https://wa.me/", "").replace(/\D/g, "");
        const formatted = numbers.startsWith("55") ? numbers : `55${numbers}`;
        return `https://wa.me/+${formatted}`;
    }

    const clientePagina = await ClientePagina.findOne({
        clienteId: tenantRaw._id,
        "paginas.slug": slug,
        "paginas.ativo": true
    });

    // Extract the specific page
    const page = clientePagina?.paginas.find((p: IPagina) => p.slug === slug && p.ativo);

    if (!page) {
        notFound();
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-12 mt-12">
            {/* Conteúdo Principal */}
            <div className="mb-4 space-y-2">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white">
                    {page.emoji && <span className="text-4xl">{page.emoji}</span>}
                    {page.titulo}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">&nbsp;</p>
            </div>
            
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white dark:border-zinc-800/50 rounded-sm p-6 shadow-xl shadow-zinc-200/50 dark:shadow-black/20">
                {/* Título */}

                {/* Conteúdo de Texto */}
                {(page.tipo === 'texto' || page.tipo === 'ambos') && page.texto && (
                    <div 
                        className="prose prose-zinc"
                        dangerouslySetInnerHTML={{ __html: page.texto }}
                    />
                )}

                {/* Cards */}
                {(page.tipo === 'cards' || page.tipo === 'ambos') && page.cards?.length > 0 && (
                    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 ${page.tipo === 'ambos' ? 'mt-12' : ''}`}>
                        {page.cards?.filter((card: ICard) => card.ativo).map((card: ICard, index: number) => (
                            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-zinc-200 dark:border-zinc-800">
                                <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 py-4">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        {card.emoji && <span>{card.emoji}</span>}
                                        {card.titulo}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <p className="text-zinc-600 dark:text-zinc-300 mb-4 text-sm leading-relaxed">
                                        <div dangerouslySetInnerHTML={{ __html: card.texto.replace(/\n/g, '<br />') }} />
                                    </p>
                                    {card.extra && (
                                        <div className="pt-4 mt-auto border-t border-dashed border-zinc-200 dark:border-zinc-800">
                                            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                                                {card.extra}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
