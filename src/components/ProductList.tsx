import { Types } from 'mongoose';
import connectDB from "@/lib/mongodb";
import Link from "next/link";
import { DeleteProductButton } from "./DeleteProductButton"; // Importe o novo botão
import { Cardapio } from "@/models/Cardapio";
import { Edit, Package } from "lucide-react";
import { deleteProductAction } from "@/lib/actions/product";
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

    if (!cardapio) return <p className="text-slate-500">Nenhum produto cadastrado.</p>;

    // Função auxiliar para renderizar cada seção
    const renderSection = (title: string, items: IProductItem[], categoryKey: string) => {
    if (!items || items.length === 0) return null;

        return (
        <div className="mt-6">
            <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider">{title}</h3>
            <div className="grid gap-3">
            {items.map((item) => (
                <div key={item._id.toString()} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 rounded bg-slate-100 overflow-hidden border">
                            {item.imageUrl ? (
                                <Image src={item.imageUrl} alt={item.nome} fill className="object-cover" />
                            ) : (
                                <Package className="h-6 w-6 m-auto mt-3 text-slate-300" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-slate-800">{item.nome}</p>
                            <p className="text-xs text-slate-400">
                                R$ {item.preco.toFixed(2)} | {item.gramasEmbalagem || item.mlEmbalagem || 0}{item.mlEmbalagem ? 'ml' : 'g'}/embalagem
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-600 hover:text-blue-600 transition-colors">
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
        {renderSection("🔥 Carnes", cardapio.carnes || [], "carnes")}
        {renderSection("🍹 Bebidas", cardapio.bebidas || [], "bebidas")}
        {renderSection("🥗 Acompanhamentos", cardapio.acompanhamentos || [], "acompanhamentos")}
        {renderSection("🍰 Sobremesas", cardapio.sobremesas || [], "sobremesas")}
        {renderSection("➕ Adicionais", cardapio.adicionais || [], "adicionais")}
    </div>
);
}