import connectDB from '@/lib/mongodb';
import { Tenant, Product as LegacyProduct, Category } from '@/models/Schemas';
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
    unidade?: string;
    ativo?: boolean;
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
    categoryId?: string;
    baseType?: string;
    categoria?: string;
    categoriaIcon?: string;
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

    // Buscar categorias do tenant
    const categories = await Category.find({ tenantId: tenant._id }).lean();

    // Buscar produtos do modelo antigo/alternativo (Product)
    const legacyProducts = await LegacyProduct.find({ tenantId: tenant._id }).sort({ createdAt: -1 }).lean();

    // Produtos do Cardapio - converter strings _id e aplicar categorias
    const categoryLabels: Record<string, string> = {
        'carnes': 'Carnes',
        'bebidas': 'Bebidas',
        'acompanhamentos': 'Acompanhamentos',
        'outros': 'Outros',
        'sobremesas': 'Sobremesas',
        'suprimentos': 'Suprimentos'
    };

    const processarProdutos = (items: IItem[], baseType: string): UnifiedProduct[] =>
        items
            .filter((item: IItem) => item.ativo !== false)
            .map((item: IItem) => {
                const customCat = item.categoryId ? categories.find(c => c._id.toString() === item.categoryId.toString()) : null;
                // Priorizar categoria com order: -1 como override do tipo base
                const defaultCatForType = categories.find(c => c.type === baseType && c.active && c.order === -1) 
                                   || categories.find(c => c.type === baseType && c.active);
                
                return {
                    ...item,
                    _id: typeof item._id === 'string' ? item._id : item._id?.toString?.() || '',
                    baseType,
                    categoria: customCat ? customCat.name : (defaultCatForType ? defaultCatForType.name : categoryLabels[baseType]),
                    categoriaEmoji: customCat?.emoji || defaultCatForType?.emoji
                } as UnifiedProduct;
            });

    // Mapear produtos legados para o formato unificado
    type LegacyProductType = typeof legacyProducts[0];
    const formattedLegacyProducts: UnifiedProduct[] = legacyProducts.map((p: LegacyProductType) => {
        const pData = p as unknown as Record<string, unknown>;
        const defaultCatForType = categories.find(c => c.type === 'outros' && c.active);
        
        return {
            _id: p._id?.toString?.() || '',
            nome: (pData.name as string) || '',
            preco: (pData.price as number) || 0,
            descricao: (pData.description as string) || '',
            imageUrl: pData.imageUrl as string | undefined,
            unidade: pData.unit as string | undefined,
            ativo: true,
            baseType: 'outros', // Fallback para legados se não houver tipo
            categoria: defaultCatForType ? defaultCatForType.name : '🛒 Produtos Legados',
            categoriaEmoji: defaultCatForType?.emoji
        };
    });

    const flatProdutos: UnifiedProduct[] = [
        ...processarProdutos(cardapio?.carnes || [], 'carnes'),
        ...processarProdutos(cardapio?.bebidas || [], 'bebidas'),
        ...processarProdutos(cardapio?.acompanhamentos || [], 'acompanhamentos'),
        ...processarProdutos(cardapio?.outros || [], 'outros'),
        ...processarProdutos(cardapio?.sobremesas || [], 'sobremesas'),
        ...processarProdutos(cardapio?.suprimentos || [], 'suprimentos'),
        ...formattedLegacyProducts
    ];

    // Agrupar produtos por categoria resolvida
    const produtosPorCategoriaMap = flatProdutos.reduce((acc, produto) => {
        const catName = produto.categoria || 'Outros';
        if (!acc[catName]) acc[catName] = [];
        acc[catName].push(produto);
        return acc;
    }, {} as Record<string, UnifiedProduct[]>);

    const baseTypeOrder = ['carnes', 'bebidas', 'acompanhamentos', 'outros', 'sobremesas', 'suprimentos'];
    const categoryIcons: Record<string, string> = {
        'carnes': '🥩',
        'bebidas': '🍻',
        'acompanhamentos': '🥗',
        'outros': '🧀',
        'sobremesas': '🍰',
        'suprimentos': '🍴'
    };

    // Ordenar categorias
    const produtosPorCategoria = Object.entries(produtosPorCategoriaMap)
        .sort(([nameA, itemsA], [nameB, itemsB]) => {
            const typeA = itemsA[0]?.baseType || 'outros';
            const typeB = itemsB[0]?.baseType || 'outros';
            const orderA = baseTypeOrder.indexOf(typeA);
            const orderB = baseTypeOrder.indexOf(typeB);
            
            if (orderA !== orderB) return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
            return nameA.localeCompare(nameB);
        });
    const categoria = tenant.colorPrimary || "#059669";

    return (
        <section className="max-w-6xl mx-auto px-6 py-12 mt-12">
            <div className="my-4 space-y-2">
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase">
                    🔥 Cardápio
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">
                    Veja a lista dos produtos disponíveis para seu evento.
                </p>
            </div>

            <div className="space-y-12">
                {produtosPorCategoria.length > 0 ? (
                    produtosPorCategoria.map(([catName, produtosCategoria]) => {
                        const icon = produtosCategoria[0]?.categoriaEmoji || categoryIcons[produtosCategoria[0]?.baseType || 'outros'] || '📍';

                        return (
                            <div key={catName} className="space-y-4">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                    <span className="text-3xl">{icon}</span>
                                    {catName}
                                </h2>

                                <div className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg space-y-6 bg-white dark:bg-zinc-800 p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                        {produtosCategoria.map((item: UnifiedProduct) => (
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
