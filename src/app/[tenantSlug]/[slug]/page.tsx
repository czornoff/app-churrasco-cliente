import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import { ClientePagina } from "@/models/ClientePagina";
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
        "paginas.slug": slug
    }).select("paginas.$");

    const page = clientePagina?.paginas[0];

    if (!page) return { title: "Página não encontrada" };

    const emoji = page.emoji ? `${page.emoji} ` : "";
    return {
        title: `${emoji}${page.titulo} | ${tenant.name}`,
        description: page.texto.substring(0, 160)
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { tenantSlug, slug } = await params;
    await connectDB();

    const tenant = await Tenant.findOne({ slug: tenantSlug, active: true }).select("_id primaryColor name");

    if (!tenant) {
        notFound();
    }

    const clientePagina = await ClientePagina.findOne({
        clienteId: tenant._id,
        "paginas.slug": slug,
        "paginas.ativo": true
    });

    // Extract the specific page
    const page = clientePagina?.paginas.find((p: any) => p.slug === slug && p.ativo);

    if (!page) {
        notFound();
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">
                    {page.emoji && <span className="mr-2">{page.emoji}</span>}
                    {page.titulo}
                </h1>

                {page.tipo === 'texto' && (
                    <div
                        className="prose prose-lg dark:prose-invert max-w-none mt-6 bg-white dark:bg-zinc-900/50 p-6 md:p-10 rounded-2xl shadow-sm border border-neutral-100 dark:border-zinc-800"
                        dangerouslySetInnerHTML={{ __html: page.texto.replace(/\n/g, '<br />') }}
                    />
                )}
            </div>

            {page.tipo === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {page.cards?.filter((card: any) => card.ativo).map((card: any, index: number) => (
                        <Card key={index} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-neutral-200 dark:border-zinc-800">
                            <CardHeader className="bg-neutral-50 dark:bg-zinc-900/50 border-b border-neutral-100 dark:border-zinc-800 py-4">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    {card.emoji && <span>{card.emoji}</span>}
                                    {card.titulo}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm leading-relaxed">
                                    {card.texto}
                                </p>
                                {card.extra && (
                                    <div className="pt-4 mt-auto border-t border-dashed border-neutral-200 dark:border-zinc-800">
                                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
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
    );
}
