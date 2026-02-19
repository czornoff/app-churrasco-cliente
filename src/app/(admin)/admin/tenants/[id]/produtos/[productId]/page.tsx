import { Cardapio } from "@/models/Cardapio";
import connectDB from "@/lib/mongodb";
import { ProductForm } from "@/components/ProductForm";
import { notFound } from "next/navigation";

export default async function EditProductPage(props: { 
  params: Promise<{ id: string, productId: string }>, // Tipado como Promise
  searchParams: Promise<{ category: string }>         // Tipado como Promise
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    
    const { id, productId } = params;
    const category = searchParams.category;

    await connectDB();

    // Busca o cardápio do tenant
    const cardapio = await Cardapio.findOne({ tenantId: id }).lean();

    if (!cardapio || !category) return notFound();

    // Definir tipo para o array de produtos
    interface ProductItem {
        _id?: unknown;
        nome: string;
        preco: number;
        subCategoriaBebida?: string; // Adicionar este campo
        [key: string]: unknown;
    }

    // Localiza o produto específico dentro do array da categoria
    const productList = cardapio ? (cardapio[category] as ProductItem[]) : [];
    const product = productList?.find(p => p._id?.toString() === productId);

    if (!product) return notFound();

    // Converte para objeto simples (Plain Object) para o Client Component
    const initialData = JSON.parse(JSON.stringify({
        ...product,
        category: category
    }));

    return (
        <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Editar Produto</h1>
        <ProductForm tenantId={id} initialData={initialData} />
        </div>
    );
}