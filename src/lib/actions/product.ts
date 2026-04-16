"use server"

import connectDB from "@/lib/mongodb";
import { Types } from 'mongoose';
import { Cardapio } from "@/models/Cardapio";
import { Category } from "@/models/Schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface ProductItem {
    _id?: Types.ObjectId | string;
    nome: string;
    preco: number;
    imageUrl?: string;
    gramasPorAdulto?: number;
    gramasEmbalagem?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    qtdePorAdulto?: number;
    tipoSuprimento?: string;
    subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
    ativo?: boolean;
    indicado?: boolean;
    favorito?: boolean;
    categoryId?: string;
}

interface CardapioDocument {
    [key: string]: ProductItem[] | unknown;
    carnes: ProductItem[];
    bebidas: ProductItem[];
    acompanhamentos: ProductItem[];
    outros: ProductItem[];
    sobremesas: ProductItem[];
    suprimentos: ProductItem[];
}

interface ProdutoFormatado {
    _id: string;
    nome: string;
    preco: number;
    categoria: string;
    categoriaEmoji?: string;
    gramasPorAdulto?: number;
    gramasEmbalagem?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    qtdePorAdulto?: number;
    tipoSuprimento?: string;
    subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
    indicado?: boolean;
    favorito?: boolean;
    categoryId?: string;
    baseType?: string;
}

export async function saveProductAction(prevState: any, formData: FormData) {
    await connectDB();

    const tenantId = formData.get("tenantId") as string;
    const productId = formData.get("productId") as string;
    const nome = formData.get("nome") as string;
    const categoryId = formData.get("categoryId") as string;
    let category = formData.get("category") as string;

    if (categoryId) {
        const dbCategory = await Category.findById(categoryId);
        if (dbCategory) {
            category = dbCategory.type;
        }
    }

    const categoryMap: Record<string, string> = {
        carnes: "carnes",
        bebidas: "bebidas",
        acompanhamentos: "acompanhamentos",
        outros: "outros",
        sobremesas: "sobremesas",
        suprimentos: "suprimentos"
    };

    const targetArray = categoryMap[category];

    if (!targetArray) {
        return { success: false, message: "Categoria válida não identificada" };
    }

    const rawImageUrl = formData.get("imageUrl") as string || "";

    const imageUrl = (rawImageUrl && !rawImageUrl.includes('mandebem.com') && !rawImageUrl.includes('placeholder'))
        ? rawImageUrl.trim()
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(nome || "Produto")}&background=random&size=512`;

    const productData: ProductItem = {
        nome,
        preco: Number(formData.get("preco")) || 0,
        imageUrl,
        ativo: formData.get("ativo") === "on",
        indicado: formData.get("indicado") === "on",
        favorito: formData.get("favorito") === "on",
        categoryId: categoryId || undefined
    };

    if (category === 'carnes' || category === 'acompanhamentos' || category === 'outros' || category === 'sobremesas') {
        productData.gramasPorAdulto = Number(formData.get("gramasPorAdulto")) || 0;
        productData.gramasEmbalagem = Number(formData.get("gramasEmbalagem")) || 0;
    } else if (category === 'bebidas') {
        productData.mlPorAdulto = Number(formData.get("mlPorAdulto")) || 0;
        productData.mlEmbalagem = Number(formData.get("mlEmbalagem")) || 0;
        const subCategoriaBebida = formData.get("subCategoriaBebida") as string;

        if (subCategoriaBebida === 'alcoolica' || subCategoriaBebida === 'nao-alcoolica') {
            productData.subCategoriaBebida = subCategoriaBebida;
        } else {
            productData.subCategoriaBebida = 'nao-alcoolica';
        }
    } else if (category === 'suprimentos') {
        productData.qtdePorAdulto = Number(formData.get("qtdePorAdulto")) || 0;
        productData.gramasEmbalagem = Number(formData.get("gramasEmbalagem")) || 0;
        const tipoSuprimento = formData.get("tipoSuprimento") as string;
        if (tipoSuprimento) {
            productData.tipoSuprimento = tipoSuprimento;
        }
    }

    try {
        if (productId) {
            const currentCardapio = await Cardapio.findOne({ tenantId }) as unknown as CardapioDocument | null;

            if (!currentCardapio) {
                return { success: false, message: "Cardápio não encontrado" };
            }

            const categories = ["carnes", "bebidas", "acompanhamentos", "outros", "sobremesas", "suprimentos"];
            const oldCategory = categories.find(cat =>
                (currentCardapio[cat] as ProductItem[]).some((p) => p._id?.toString() === productId)
            );

            if (oldCategory && oldCategory !== targetArray) {
                const oldItem = (currentCardapio[oldCategory] as ProductItem[]).find((p) => p._id?.toString() === productId);

                await Cardapio.updateOne(
                    { tenantId },
                    { $pull: { [oldCategory]: { _id: new Types.ObjectId(productId) } } }
                );

                await Cardapio.updateOne(
                    { tenantId },
                    { $push: { [targetArray]: { ...oldItem, ...productData, _id: new Types.ObjectId(productId) } } }
                );
            } else {
                const updateFields: Record<string, unknown> = {};
                Object.entries(productData).forEach(([key, value]) => {
                    updateFields[`${targetArray}.$.${key}`] = value;
                });

                await Cardapio.findOneAndUpdate(
                    { tenantId, [`${targetArray}._id`]: new Types.ObjectId(productId) },
                    { $set: updateFields },
                    { new: true }
                );
            }
        } else {
            await Cardapio.findOneAndUpdate(
                { tenantId },
                { $push: { [targetArray]: productData } },
                { upsert: true }
            );
        }
    } catch (error) {
        console.error("Erro ao salvar/editar:", error);
        return { success: false, message: "Falha na operação" };
    }

    revalidatePath(`/admin/tenants/${tenantId}`);
    return { success: true, message: "Produto salvo com sucesso!" };
}

export async function deleteProductAction(tenantId: string, category: string, productId: string) {
    await connectDB();

    try {
        await Cardapio.findOneAndUpdate(
            { tenantId },
            { $pull: { [category]: { _id: new Types.ObjectId(productId) } } }
        );

        revalidatePath(`/admin/tenants/${tenantId}`);
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar:", error);
        return { success: false };
    }
}

export async function getCardapioByTenant(tenantId: string) {
    await connectDB();

    try {
        const cardapio = await Cardapio.findOne({ tenantId }).lean() as unknown as CardapioDocument | null;

        if (!cardapio) {
            return { success: false, produtos: [] };
        }

        // Buscar categorias do tenant para mapear nomes
        const categories = await Category.find({ tenantId }).lean();
        const categoryLabels: Record<string, { name: string, type: string }> = {
            'carnes': { name: 'Carnes', type: 'carnes' },
            'bebidas': { name: 'Bebidas', type: 'bebidas' },
            'acompanhamentos': { name: 'Acompanhamentos', type: 'acompanhamentos' },
            'outros': { name: 'Outros', type: 'outros' },
            'sobremesas': { name: 'Sobremesas', type: 'sobremesas' },
            'suprimentos': { name: 'Suprimentos', type: 'suprimentos' }
        };

        const todosProdutos: ProdutoFormatado[] = [];

        const todasAsCategories = ['carnes', 'bebidas', 'acompanhamentos', 'outros', 'sobremesas', 'suprimentos'];

        todasAsCategories.forEach(arrayName => {
            if (cardapio[arrayName] && Array.isArray(cardapio[arrayName])) {
                (cardapio[arrayName] as ProductItem[]).forEach((produto) => {
                    if (produto.ativo !== false) {
                        // Determinar nome e ícone padrão para esta baseType
                        // Priorizamos a categoria que tem order: -1 como o "Override Global" do tipo.
                        const defaultCatForType = categories.find(c => c.type === arrayName && c.active && c.order === -1) 
                                           || categories.find(c => c.type === arrayName && c.active);
                        
                        const customCat = produto.categoryId ? categories.find(c => c._id.toString() === produto.categoryId.toString()) : null;
                        
                        const produtoFormatado: ProdutoFormatado = {
                            _id: produto._id?.toString() || '',
                            nome: produto.nome,
                            preco: produto.preco || 0,
                            categoria: customCat ? customCat.name : (defaultCatForType ? defaultCatForType.name : categoryLabels[arrayName].name),
                            categoriaEmoji: customCat?.emoji || defaultCatForType?.emoji,
                            categoryId: produto.categoryId?.toString(),
                            baseType: arrayName, // Importante para a calculadora
                            indicado: produto.indicado,
                            favorito: produto.favorito,
                            imageUrl: produto.imageUrl,
                        };

                        // Adicionar campos específicos da categoria base
                        if (arrayName === 'carnes' || arrayName === 'acompanhamentos' || arrayName === 'outros' || arrayName === 'sobremesas') {
                            produtoFormatado.gramasPorAdulto = produto.gramasPorAdulto || 0;
                            produtoFormatado.gramasEmbalagem = produto.gramasEmbalagem || 0;
                        } else if (arrayName === 'bebidas') {
                            produtoFormatado.mlPorAdulto = produto.mlPorAdulto || 0;
                            produtoFormatado.mlEmbalagem = produto.mlEmbalagem || 0;
                            if (produto.subCategoriaBebida) {
                                produtoFormatado.subCategoriaBebida = produto.subCategoriaBebida;
                            }
                        } else if (arrayName === 'suprimentos') {
                            produtoFormatado.qtdePorAdulto = produto.qtdePorAdulto || 0;
                            produtoFormatado.gramasEmbalagem = produto.gramasEmbalagem || 0;
                            if (produto.tipoSuprimento) {
                                produtoFormatado.tipoSuprimento = produto.tipoSuprimento;
                            }
                        }

                        todosProdutos.push(produtoFormatado);
                    }
                });
            }
        });

        return { success: true, produtos: todosProdutos };
    } catch (error) {
        console.error("Erro ao buscar cardápio:", error);
        return { success: false, produtos: [] };
    }
}