import connectDB from '@/lib/mongodb';
import { Tenant, Product as LegacyProduct } from '@/models/Schemas';
import { Cardapio, IItem } from '@/models/Cardapio';
import Image from "next/image";
import { UtensilsCrossed } from 'lucide-react';

interface FormattedProduct {
    _id: string;
    nome: string;
    preco: number;
    descricao?: string;
    imageUrl?: string;
    gramasEmbalagem?: number;
    mlEmbalagem?: number;
    unidade?: string;
    ativo: boolean;
}

type UnifiedProduct = (IItem | FormattedProduct) & {
    _id: string;
    nome: string;
    preco: number;
    ativo?: boolean;
    descricao?: string;
    imageUrl?: string;
    gramasEmbalagem?: number;
    mlEmbalagem?: number;
    unidade?: string;
};

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

    // Produtos do Cardapio - converter strings _id
    const processarProdutos = (items: IItem[]): UnifiedProduct[] =>
        items
            .filter((item: IItem) => item.ativo === true)
            .map((item: IItem) => ({
                ...item,
                _id: typeof item._id === 'string' ? item._id : item._id?.toString?.() || ''
            } as UnifiedProduct));

    // Mapear produtos legados para o formato unificado
    type LegacyProductType = typeof legacyProducts[0];
    const formattedLegacyProducts: UnifiedProduct[] = legacyProducts.map((p: LegacyProductType) => {
        const pData = p as unknown as Record<string, unknown>;
        return {
            _id: p._id?.toString?.() || '',
            nome: (pData.name as string) || '',
            preco: (pData.price as number) || 0,
            descricao: (pData.description as string) || '',
            imageUrl: pData.imageUrl as string | undefined,
            unidade: pData.unit as string | undefined,
            ativo: true
        };
    });

    // Agrupar produtos por categoria
    const produtosPorCategoria = {
        carnes: processarProdutos(cardapio?.carnes || []),
        bebidas: processarProdutos(cardapio?.bebidas || []),
        acompanhamentos: processarProdutos(cardapio?.acompanhamentos || []),
        outros: processarProdutos(cardapio?.outros || []),
        sobremesas: processarProdutos(cardapio?.sobremesas || []),
        suprimentos: processarProdutos(cardapio?.suprimentos || []),
        legados: formattedLegacyProducts
    };

    // Nomes amigáveis das categorias
    const categoriasNomes: Record<string, string> = {
        carnes: '🥩 Carnes',
        bebidas: '🍻 Bebidas',
        acompanhamentos: '🥗 Acompanhamentos',
        outros: '🧀 Outros',
        sobremesas: '🍰 Sobremesas',
        suprimentos: '🍴 Suprimentos',
        legados: '🛒 Produtos Legados'
    };

    const categoriasOrdem = ['carnes', 'bebidas', 'acompanhamentos', 'outros', 'sobremesas', 'suprimentos', 'legados'];
    const categoria = tenant.colorPrimary || "#059669";

    return (
        <section className="max-w-6xl mx-auto px-6 py-12 mt-12">
            <div className="mb-8 space-y-2">
                <h1 className="text-4xl font-black text-zinc-900 dark:text-white">
                    🔥 Cardápio
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Veja a lista dos produtos disponíveis para seu evento.
                </p>
            </div>

            <div className="space-y-12">
                {categoriasOrdem.some(cat => produtosPorCategoria[cat].length > 0) ? (
                    categoriasOrdem.map((cat) => {
                        const produtos = produtosPorCategoria[cat as keyof typeof produtosPorCategoria];
                        if (produtos.length === 0) return null;

                        return (
                            <div key={cat} className="space-y-4">
                                <div className="border-b border-zinc-200 dark:border-zinc-700 pb-3">
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                        {categoriasNomes[cat]}
                                    </h2>
                                </div>

                                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white dark:border-zinc-800/50 rounded-lg p-6 shadow-xl shadow-zinc-200/50 dark:shadow-black/20">
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                        {produtos.map((item: UnifiedProduct) => (
                                            <div
                                                key={item._id.toString()}
                                                className="group bg-white dark:bg-zinc-800 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                            >
                                                {/* Product Image */}
                                                <div className="relative w-full h-36 bg-zinc-100 dark:bg-zinc-700">
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
                                                    <h3 className="text-md font-bold text-zinc-900 dark:text-white mb-0 pb-0 line-clamp-1">
                                                        {item.nome}
                                                    </h3>
                                                    {item.gramasEmbalagem > 0 && (
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                                                            por {item.gramasEmbalagem}g
                                                        </span>
                                                    )}
                                                    {item.mlEmbalagem > 0 && (
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">
                                                            por {item.mlEmbalagem}ml
                                                        </span>
                                                    )}
                                                    {item.descricao && (
                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                                            {item.descricao}
                                                        </p>
                                                    )}
                                                    <div className="pt-2 flex items-center justify-end">
                                                        <span className="text-xl font-black" style={{ color: categoria }}>
                                                            R$ {item.preco.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-white dark:border-zinc-800/50 rounded-lg p-6 shadow-xl">
                        <div className="flex flex-col items-center justify-center min-h-75 text-center space-y-4">
                            <UtensilsCrossed size={64} className="text-zinc-300 dark:text-zinc-700" />
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                                    Cardápio em construção
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-500">
                                    Os produtos serão adicionados em breve.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
