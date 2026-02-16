import connectDB from '@/lib/mongodb';
import { Tenant, Product as LegacyProduct } from '@/models/Schemas';
import { Cardapio } from '@/models/Cardapio';
import Image from "next/image";
import { UtensilsCrossed } from 'lucide-react';

interface CardapioPageProps {
    params: Promise<{ tenantSlug: string }>;
}

export default async function CardapioPage({ params }: CardapioPageProps) {
    const { tenantSlug } = await params;
    await connectDB();

    const tenant = await Tenant.findOne({ slug: tenantSlug }).lean();
    if (!tenant) return null;

    // Buscar cardápio do tenant (Modelo Novo)
    const cardapio = await Cardapio.findOne({ tenantId: tenant._id }).lean();

    // Buscar produtos do modelo antigo/alternativo (Product)
    const legacyProducts = await LegacyProduct.find({ tenantId: tenant._id }).sort({ createdAt: -1 }).lean();

    // Produtos do Cardapio
    const cardapioItems = [
        ...(cardapio?.carnes || []),
        ...(cardapio?.bebidas || []),
        ...(cardapio?.acompanhamentos || []),
        ...(cardapio?.sobremesas || []),
        ...(cardapio?.adicionais || [])
    ].filter((item: any) => item.ativo);

    // Mapear produtos legados para o formato unificado
    const formattedLegacyProducts = legacyProducts.map((p: any) => ({
        _id: p._id,
        nome: p.name,
        preco: p.price,
        descricao: p.description || '',
        imageUrl: p.imageUrl,
        unidade: p.unit,
        ativo: true
    }));

    // Combinar listas
    const allProducts = [...cardapioItems, ...formattedLegacyProducts];
    const primaryColor = tenant.colorPrimary || "#059669";

    return (
        <section className="max-w-6xl mx-auto px-6 pb-32 mt-20">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white dark:border-zinc-800/50 rounded-sm p-8 md:p-12 shadow-xl shadow-neutral-200/50 dark:shadow-black/20">
                {allProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {allProducts.map((item: any) => (
                            <div
                                key={item._id.toString()}
                                className="group bg-white dark:bg-zinc-800 rounded-sm overflow-hidden border border-neutral-200 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                            >
                                {/* Product Image */}
                                <div className="relative w-full h-48 bg-neutral-100 dark:bg-zinc-700">
                                    <Image
                                        unoptimized
                                        src={item.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nome)}&background=random`}
                                        alt={item.nome}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="p-4 space-y-2">
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white line-clamp-1">
                                        {item.nome}
                                    </h3>
                                    {item.descricao && (
                                        <p className="text-sm text-neutral-600 dark:text-zinc-400 line-clamp-2">
                                            {item.descricao}
                                        </p>
                                    )}
                                    <div className="pt-2 flex items-center justify-between">
                                        <span className="text-2xl font-black" style={{ color: primaryColor }}>
                                            R$ {item.preco.toFixed(2)}
                                        </span>
                                        {item.unidade && (
                                            <span className="text-xs text-neutral-500 dark:text-zinc-500 font-medium">
                                                por {item.unidade}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-4">
                        <UtensilsCrossed size={64} className="text-neutral-300 dark:text-zinc-700" />
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                                Cardápio em construção
                            </h3>
                            <p className="text-neutral-500 dark:text-zinc-500">
                                Os produtos serão adicionados em breve.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
