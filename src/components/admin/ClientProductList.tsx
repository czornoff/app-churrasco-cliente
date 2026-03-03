'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Edit, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteProductButton } from '@/components/DeleteProductButton';
import { toast } from 'sonner';
import { ProductForm } from '@/components/ProductForm';

interface IProductItem {
    _id: string;
    nome: string;
    preco: number;
    imageUrl?: string;
    gramasPorAdulto?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    gramasEmbalagem?: number;
    ativo: boolean;
    category?: string;
}

interface ClientProductListProps {
    tenantId: string;
    tenantSlug: string;
}

export function ClientProductList({ tenantId, tenantSlug }: ClientProductListProps) {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [cardapio, setCardapio] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (view === 'list') {
            fetchCardapio();
        }
    }, [tenantId, view]);

    const fetchCardapio = async () => {
        try {
            setLoading(true);
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/cardapio?tenantId=${tenantId}`);
            if (!res.ok) throw new Error('Failed to fetch cardapio');
            const data = await res.json();
            setCardapio(data);
        } catch (error) {
            toast.error('Erro ao carregar produtos');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingProduct(null);
        setView('editor');
    };

    const handleEdit = (item: IProductItem, category: string) => {
        setEditingProduct({ ...item, category });
        setView('editor');
    };

    const handleBack = () => {
        setView('list');
        setEditingProduct(null);
    };

    const renderSection = (title: string, items: IProductItem[], categoryKey: string) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="mt-6 animate-in fade-in duration-300">
                <h3 className="text-sm font-bold uppercase text-zinc-400 mb-3 tracking-wider">{title}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                    {items.map((item) => (
                        <div key={item._id.toString()} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border rounded-lg hover:shadow-sm transition-shadow group">
                            <div className="flex items-center gap-4">
                                <div className="relative h-12 w-12 rounded bg-zinc-100 overflow-hidden border">
                                    <Image
                                        unoptimized
                                        src={((item.imageUrl && !item.imageUrl.includes('mandebem.com') && !item.imageUrl.includes('placeholder')) ? item.imageUrl.trim() : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.nome || "Produto")}&background=random&size=128`}
                                        alt={item.nome}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{item.nome}</p>
                                    <p className="text-xs text-zinc-500">
                                        R$ {item.preco.toFixed(2)} | {item.gramasEmbalagem || item.mlEmbalagem || 0}{item.mlEmbalagem ? 'ml' : 'g'}/embalagem
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(item, categoryKey)}
                                    className="h-8 w-8 p-0 text-zinc-600 hover:text-orange-600 transition-colors"
                                >
                                    <Edit size={16} />
                                </Button>
                                <DeleteProductButton
                                    tenantId={tenantId}
                                    category={categoryKey}
                                    productId={item._id.toString()}
                                    onSuccess={fetchCardapio}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (view === 'editor') {
        return (
            <ProductForm
                tenantId={tenantId}
                initialData={editingProduct}
                onBack={handleBack}
                onSuccess={() => {
                    handleBack();
                }}
            />
        );
    }

    if (loading) return <div className="p-8 text-center text-zinc-500">Carregando produtos...</div>;

    const hasProducts = cardapio && (
        (cardapio.carnes?.length || 0) > 0 ||
        (cardapio.bebidas?.length || 0) > 0 ||
        (cardapio.acompanhamentos?.length || 0) > 0 ||
        (cardapio.outros?.length || 0) > 0 ||
        (cardapio.sobremesas?.length || 0) > 0 ||
        (cardapio.suprimentos?.length || 0) > 0
    );

    return (
        <div className="pb-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">Itens do Cardápio</h2>
                <Button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Item
                </Button>
            </div>

            {!hasProducts ? (
                <div className="p-12 text-center flex flex-col items-center gap-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <FileText className="text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Nenhum produto cadastrado</h3>
                        <p className="text-zinc-500 text-sm mt-1">Comece adicionando itens ao seu cardápio.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {renderSection("🥩 Carnes", cardapio.carnes || [], "carnes")}
                    {renderSection("🍻 Bebidas", cardapio.bebidas || [], "bebidas")}
                    {renderSection("🥗 Acompanhamentos", cardapio.acompanhamentos || [], "acompanhamentos")}
                    {renderSection("🧀 Outros", cardapio.outros || [], "outros")}
                    {renderSection("🍰 Sobremesas", cardapio.sobremesas || [], "sobremesas")}
                    {renderSection("🍴 Suprimentos", cardapio.suprimentos || [], "suprimentos")}
                </div>
            )}
        </div>
    );
}
