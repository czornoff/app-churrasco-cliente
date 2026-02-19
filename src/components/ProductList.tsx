import { Types } from 'mongoose';
import connectDB from "@/lib/mongodb";
import Link from "next/link";
import { DeleteProductButton } from "./DeleteProductButton"; // Importe o novo botão
import { Cardapio } from "@/models/Cardapio";
import { Edit } from "lucide-react";
import Image from "next/image";

interface IProductItem {
    _id: string | Types.ObjectId; // o _id do Mongo pode vir como objeto ou string no lean()
    nome: string;
    preco: number;
    imageUrl?: string;
    gramasPorAdulto?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    gramasEmbalagem?: number;
    ativo: boolean;
}

export async function ProductList({ tenantId }: { tenantId: string }) {
    await connectDB();
    const cardapio = await Cardapio.findOne({ tenantId }).lean();

    if (!cardapio) return <p className="text-zinc-500">Nenhum produto cadastrado.</p>;

    // Função auxiliar para renderizar cada seção
    const renderSection = (title: string, items: IProductItem[], categoryKey: string) => {
        if (!items || items.length === 0) return null;

        return (
            <div className="mt-6">
                <h3 className="text-sm font-bold uppercase text-zinc-400 mb-3 tracking-wider">{title}</h3>
                <div className="grid gap-3 md:grid-cols-2">
                    {items.map((item) => (
                        <div key={item._id.toString()} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border rounded-lg hover:shadow-sm transition-shadow">
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
                                    <p className="font-medium text-zinc-400">{item.nome}</p>
                                    <p className="text-xs text-zinc-400">
                                        R$ {item.preco.toFixed(2)} | {item.gramasEmbalagem || item.mlEmbalagem || 0}{item.mlEmbalagem ? 'ml' : 'g'}/embalagem
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="p-2 text-zinc-600 hover:text-blue-600 transition-colors">
                                    <Link href={`/admin/tenants/${tenantId}/produtos/${item._id}?category=${categoryKey}`}>
                                        <Edit size={18} />
                                    </Link>
                                </button>
                                <DeleteProductButton
                                    tenantId={tenantId}
                                    category={categoryKey}
                                    productId={item._id.toString()}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="pb-10">
            {renderSection("🔥 Carnes", (cardapio.carnes || []) as IProductItem[], "carnes")}
            {renderSection("🍹 Bebidas", (cardapio.bebidas || []) as IProductItem[], "bebidas")}
            {renderSection("🥗 Acompanhamentos", (cardapio.acompanhamentos || []) as IProductItem[], "acompanhamentos")}
            {renderSection("➕ Outros", (cardapio.outros || []) as IProductItem[], "outros")}
            {renderSection("🍰 Sobremesas", (cardapio.sobremesas || []) as IProductItem[], "sobremesas")}
            {renderSection("🛠️ Suprimentos", (cardapio.suprimentos || []) as IProductItem[], "suprimentos")}
        </div>
    );
}